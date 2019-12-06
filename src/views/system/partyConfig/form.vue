<template>
  <el-dialog
    :append-to-body="true"
    :close-on-click-modal="false"
    :before-close="cancel"
    :visible.sync="dialog"
    :title="isAdd ? '新增' : '编辑'"
    width="500px"
  >
    <el-form ref="form" :model="form" :rules="rules" size="small" label-width="80px">
      <el-form-item label="聚会名称">
        <el-input v-model="form.name" style="width: 370px;" />
      </el-form-item>
      <!-- <el-form-item label="类型">
        <el-select
          v-model="form.type"
          clearable
          placeholder="类型"
          class="filter-item"
          style="width: 370px"
        >
          <el-option
            v-for="item in dictWay"
            :key="item.key"
            :label="item.display_name"
            :value="item.key"
          />
        </el-select>
      </el-form-item> -->
      <el-form-item label="聚会形式" prop="enabled">
        <el-radio 
          v-for="(item) in dicts"
          :key="item.id" 
          v-model="form.type"
          :label="item.value"
        >{{ item.label }}</el-radio>
      </el-form-item>
      <el-form-item label="备注">
        <el-input v-model="form.memo" style="width: 370px;" />
      </el-form-item>
       <el-form-item label="部门">
        <treeselect :options="depts" v-model="deptId" style="width: 370px"  placeholder="选择部门"  />
      </el-form-item>
      <el-form-item label="角色">
        <el-select style="width: 370px;" v-model="roleIds" :options="roles" multiple placeholder="请选择">
          <el-option v-for="item in roles" :key="item.id" :label="item.name" :value="item.id">
          </el-option>
        </el-select>
      </el-form-item>
      
      <el-form-item  label="聚会周期">
        <component ref="dateTime" :subTimeData="partTimeData" v-bind:is="currentView"></component>
      </el-form-item>
       
    </el-form>
    
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="doSubmit">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>
import { add, edit } from "@/api/partyConfig";
import { getDepts } from '@/api/dept'
import { getAll, getLevel } from '@/api/role'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
export default {
  components: { 
    Treeselect,
    dateCom: {
                props:['subTimeData'],
                template: '<el-date-picker ref="partTime" v-model="partTime" type="datetimerange" style="width: 370px;" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>',
                data: function(){
	                return {
                    partTime:this.subTimeData
	                }	
                },
            },
    weekendCom: {
                props:['subTimeData'],
                template: '<el-select ref="foweekends" v-model="partTime" clearable multiple class="filter-item" style="width: 370px"> <el-option v-for="item in dictWeekends" :key="item.key" :label="item.display_name" :value="item.key"/></el-select>',
                data: function(){
	                return {
                    dictWeekends: [
                      { key: "1", display_name: "周一" },
                      { key: "2", display_name: "周二" },
                      { key: "3", display_name: "周三" },
                      { key: "4", display_name: "周四" },
                      { key: "5", display_name: "周五" },
                      { key: "6", display_name: "周六" },
                      { key: "7", display_name: "周天" }
                    ],
                    partTime:this.subTimeData
	                }	
                },
            }
  },
  props: {
    isAdd: {
      type: Boolean,
      required: true
    },
    dicts: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      loading: false,
      dialog: false,
      //currentView: 'weekendCom',
      form: {
        id: "",
        name: "",
        type: "",
        memo: "",roles: [], dept: { id: '' },
        selectDeptIds: ""
      },
      depts: [],roles: [], deptId: null,
      rules: {},roleIds: [],
      dictWeekend: [
        { key: "1", display_name: "周一" },
        { key: "2", display_name: "周二" },
        { key: "3", display_name: "周三" },
        { key: "4", display_name: "周四" },
        { key: "5", display_name: "周五" },
        { key: "6", display_name: "周六" },
        { key: "7", display_name: "周天" }
      ],partTimeData:[]
    };
  },
  computed: {
      currentView:function() {
        if(this.form.type==1){
          return "weekendCom";
        }else {
          return "dateCom";
        }
      }
  },
  methods: {
    cancel() {
      this.resetForm();
    },
    doSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.deptId === null || this.deptId === undefined) {
            this.$message({
              message: '部门不能为空',
              type: 'warning'
            })
          } else if (this.form.name === null) {
            this.$message({
              message: '聚会名称不能为空',
              type: 'warning'
            })
          } else if (this.roleIds.length === 0) {
            this.$message({
              message: '角色不能为空',
              type: 'warning'
            })
          } else {
            this.loading = true
      this.form.roles = []
      const _this = this
      this.form.dept.id = this.deptId
      this.roleIds.forEach(function(data, index) {
              const role = { id: data }
              _this.form.roles.push(role)
            })
      if (this.isAdd) {
        this.doAdd();
      } else this.doEdit();
          }
        } else {
          return false
        }
      })
      
    },
    doAdd() {
      var param=this.form
      debugger
      if(this.form.type==1){
        var week = (this.$refs['dateTime'].$refs['foweekends'].value).join(',');
        this.form.weekends=week;
      }else{
        var timeArray=this.$refs['dateTime'].$refs['partTime'].value;
      //var timeArray = this.form.partTime;
        if(timeArray.length>0){
          this.form.startTime=timeArray[0];
          this.form.endTime=timeArray[1];
        }
      }
      
      add(this.form)
        .then(res => {
          this.resetForm();
          this.$notify({
            title: "添加成功",
            type: "success",
            duration: 2500
          });
          this.loading = false;
          this.$parent.init();
        })
        .catch(err => {
          this.loading = false;
          console.log(err.response.data.message);
        });
    },
    doEdit() {
      edit(this.form)
        .then(res => {
          this.resetForm();
          this.$notify({
            title: "修改成功",
            type: "success",
            duration: 2500
          });
          this.loading = false;
          this.$parent.init();
        })
        .catch(err => {
          this.loading = false;
          console.log(err.response.data.message);
        });
    },
    getRoles() {
      getAll().then(res => {
        this.roles = res
      }).catch(err => {
        console.log(err.response.data.message)
      })
    },
    getDepts() {
      getDepts({ enabled: true }).then(res => {
        this.depts = res.content
      })
    },
    resetForm() {
      this.dialog = false;
      this.$refs["form"].resetFields();
      this.roleIds = []
      this.form = {
        id: "",
        name: "",
        type: "",
        memo: "",
        creator: "",
        createTime: "",
        roles: [], dept: { id: '' },
        selectDeptIds: ""
      };
      this.partTimeData = [];
    },
  }
};
</script>

<style scoped>
</style>
