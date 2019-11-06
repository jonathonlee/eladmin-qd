<template>
  <el-dialog :visible.sync="dialog" :title="isAdd ? '新增文件' : '编辑文件'" append-to-body width="570px" @close="resetForm">
    <el-form ref="form"  :model="form" :rules="rules" size="small" label-width="66px">
      <el-form-item label="目录">
        <treeselect v-model="form.fileSortId" ref="tree" :options="fileSorts" @select="getSelect" :style="style" placeholder="选择目录"  />
      </el-form-item>
      
      <el-form-item label="文件" v-show="fileShow"> 
        <el-upload class="upload-demo" ref="upload" :action="uploadUrl" :data="form" :on-success="uploadsuccess" :headers="headers" :auto-upload="false" :on-change="loadJsonFromFile" :on-error="uploadError">
          <el-button slot="trigger" size="small" type="primary">选取文件</el-button>
          <!-- <el-button style="margin-left: 10px;" size="small" type="success" @click="submitUpload">上传到服务器</el-button> -->
          <!-- <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div> -->
        </el-upload>
      </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button type="text" @click="cancel">取消</el-button>
      <el-button :loading="loading" type="primary" @click="submitUpload">确认</el-button>
    </div>
  </el-dialog>
</template>

<script>

import { add, edit } from '@/api/file'
import { getFileSorts } from '@/api/fileSort'
import Treeselect from '@riophae/vue-treeselect'
import '@riophae/vue-treeselect/dist/vue-treeselect.css'
import { getToken } from '@/utils/auth'
import Config from '@/config'
export default {
  components: { Treeselect },
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
      dialog: false, loading: false, form: { fileSort:{id:""} },
      fileSorts: [], style: 'width: 184px', level: 3,currentNode:{},
      headers:{
        'Authorization':'Bearer ' + getToken(),
        //'Content-Type' :'multipart/form-data'
      },
      rules: {},fileShow:true,
      uploadUrl:Config.fileUploadUrl
    }
  },
  created() {
    const explorer = navigator.userAgent
    if (explorer.indexOf('Chrome') >= 0) {
      this.style = 'width: 184px'
    } else {
      this.style = 'width: 172px'
    }
  },
  methods: {
    cancel() {
      this.resetForm()
    },
    getSelect(node,instanceId){
      this.currentNode = node;
    },
    uploadsuccess(response, file, fileList){
      this.resetForm()
        this.$notify({
          title: '添加成功',
          type: 'success',
          duration: 2500
        })
        this.loading = false
        this.$parent.init()
    },
    uploadError(err, file, fileList){
        this.loading = false
        console.log(err);
    },
    loadJsonFromFile (file, fileList) {
      //this.uploadFilename = file.name
      this.fileList = fileList
    },
    doSubmit() {
      this.form.fileSort = this.currentNode;
      this.form.fileList=this.fileList;
      this.$refs['form'].validate((valid) => {
        if (valid) {
          if (this.form.fileSortId === null || this.form.fileSortId === undefined) {
            this.$message({
              message: '目录不能为空',
              type: 'warning'
            })
          } else {
            this.loading = true
            const _this = this
            if (this.isAdd) {
              this.doAdd()
            } else this.doEdit()
          }
        } else {
          return false
        }
      })
    },
    doAdd() {
      add(this.form).then(res => {
        this.resetForm()
        this.$notify({
          title: '添加成功',
          message: '默认密码：123456',
          type: 'success',
          duration: 2500
        })
        this.loading = false
        this.$parent.init()
      }).catch(err => {
        this.loading = false
        this.$notify({
          title: '添加失败',
          message: '文件上传失败',
          type: 'error',
          duration: 2500
        })
        console.log(err.response.data.message)
      })
    },
    doEdit() {
      edit(this.form).then(res => {
        this.resetForm()
        this.$notify({
          title: '修改成功',
          type: 'success',
          duration: 2500
        })
        this.loading = false
        this.$parent.init()
      }).catch(err => {
        this.loading = false
        this.$notify({
          title: '修改失败',
          message: '文件目录修改失败',
          type: 'error',
          duration: 2500
        })
        console.log(err.response.data.message)
      })
    },
    resetForm() {
      this.dialog = false
      this.$refs['form'].resetFields()
      this.fileList = []
      this.form = { files: [],  fileSort: { id: '' } }
    },
    getFileSorts() {
      getFileSorts({ enabled: true }).then(res => {
        this.fileSorts = res.content
      })
    },
    isvalidPhone(str) {
      const reg = /^1[3|4|5|7|8][0-9]\d{8}$/
      return reg.test(str)
    },
    selectFun(node, instanceId) {
      this.getJobs(node.id)
    },
    submitUpload() {
      this.form.fileSort = this.currentNode;
        if(this.fileShow){
          this.$refs.upload.submit();
        }else{
          this.doEdit();
        }
        
    },
  }
}
</script>

<style scoped>

</style>
