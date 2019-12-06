<template>
  <div class="app-container">
    <!--工具栏-->
    <div class="head-container">
      <!-- 新增 -->
      <div style="display: inline-block;margin: 0px 2px;">
        <el-button
          v-permission="['ADMIN','PARTYCONFIG_ALL','PARTYCONFIG_CREATE']"
          class="filter-item"
          size="mini"
          type="primary"
          icon="el-icon-plus"
          @click="add">新增</el-button>
      </div>
    </div>
    <!--表单组件-->
    <eForm ref="form" :is-add="isAdd" :dicts="dicts"/>
    <!--表格渲染-->
    <el-table v-loading="loading" :data="data" size="small" style="width: 100%;">
      <!-- <el-table-column prop="id" label="id"/> -->
      <el-table-column prop="name" label="名称"/>
      <el-table-column label="聚会类型" align="center">
            <template slot-scope="scope">
              <div v-for="item in dicts" :key="item.id">
                <el-tag v-if="scope.row.type.toString() === item.value" :type="scope.row.type? '' : 'info'">{{ item.label }}</el-tag>
              </div>
            </template>
          </el-table-column>
      <el-table-column prop="roleStr" label="参与角色"/>
      <el-table-column label="部门">
            <template slot-scope="scope">
              <div>{{ scope.row.dept.name }}</div>
            </template>
      </el-table-column>
      <el-table-column prop="memo" label="备注"/>
      <el-table-column prop="creator" label="创建人"/>
      <el-table-column prop="partyDateTime" label="聚会时间"/>
      <el-table-column prop="createTime" label="创建时间">
        <template slot-scope="scope">
          <span>{{ parseTime(scope.row.createTime) }}</span>
        </template>
      </el-table-column>

      <el-table-column v-if="checkPermission(['ADMIN','PARTYCONFIG_ALL','PARTYCONFIG_EDIT','PARTYCONFIG_DELETE'])" label="操作" width="150px" align="center">
        <template slot-scope="scope">
          <el-button v-permission="['ADMIN','PARTYCONFIG_ALL','PARTYCONFIG_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)"/>
          <el-popover
            v-permission="['ADMIN','PARTYCONFIG_ALL','PARTYCONFIG_DELETE']"
            :ref="scope.row.id"
            placement="top"
            width="180">
            <p>确定删除本条数据吗？</p>
            <div style="text-align: right; margin: 0">
              <el-button size="mini" type="text" @click="$refs[scope.row.id].doClose()">取消</el-button>
              <el-button :loading="delLoading" type="primary" size="mini" @click="subDelete(scope.row.id)">确定</el-button>
            </div>
            <el-button slot="reference" type="danger" icon="el-icon-delete" size="mini"/>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <!--分页组件-->
    <el-pagination
      :total="total"
      :current-page="page + 1"
      style="margin-top: 8px;"
      layout="total, prev, pager, next, sizes"
      @size-change="sizeChange"
      @current-change="pageChange"/>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import initDict from '@/mixins/initDict'
import { del } from '@/api/partyConfig'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData,initDict],
  data() {
    return {
      delLoading: false,
    }
  },
  created() {
    this.$nextTick(() => {
      this.init()
      this.getDict('party_type')
    })
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.url = 'api/partyConfig'
      const sort = 'id,desc'
      this.params = { page: this.page, size: this.size, sort: sort }
      return true
    },
    subDelete(id) {
      this.delLoading = true
      del(id).then(res => {
        this.delLoading = false
        this.$refs[id].doClose()
        this.dleChangePage()
        this.init()
        this.$notify({
          title: '删除成功',
          type: 'success',
          duration: 2500
        })
      }).catch(err => {
        this.delLoading = false
        this.$refs[id].doClose()
        console.log(err.response.data.message)
      })
    },
    add() {
      this.isAdd = true
      this.$refs.form.dialog = true
      this.$refs.form.getDepts()
      this.$refs.form.getRoles()
      this.$refs.form.form.type = this.$refs.form.dicts[0].value;
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      this.$refs.form.getDepts()
      this.$refs.form.getRoles()
      _this.roleIds = []
      _this.form = {
        id: data.id,
        name: data.name,
        type: data.type,
        memo: data.memo,
        creator: data.creator,
        createTime: data.createTime,
        roles: [], dept: { id: data.dept.id }
      }
      data.roles.forEach(function(data, index) {
        _this.roleIds.push(data.id)
      })
      _this.deptId = data.dept.id
      _this.dialog = true
      
      if(data.type==1){
        const arrayWeek = data.weekends.split(',');
        arrayWeek.forEach(function(data, index) {
          _this.partTimeData.push(data)
        })
      }else{
        _this.partTimeData.push(data.startTime)
        _this.partTimeData.push(data.endTime)
      }
      
    }
  }
}
</script>

<style scoped>

</style>
