<template>
  <div class="app-container">
    <!--form 组件-->
    <eForm ref="form" :is-add="isAdd" :dicts="dicts"/>
    <el-row :gutter="20">
      <!--目录数据-->
      <el-col :xs="7" :sm="6" :md="4" :lg="4" :xl="4">
        <div class="head-container">
          <el-input v-model="fileSortName" clearable placeholder="输入目录名称搜索" prefix-icon="el-icon-search" style="width: 100%;" class="filter-item" @input="getFileSortDatas"/>
        </div>
        <el-tree :data="fileSorts" :props="defaultProps" :expand-on-click-node="false" default-expand-all @node-click="handleNodeClick"/>
      </el-col>
      <!--用户数据-->
      <el-col :xs="17" :sm="18" :md="20" :lg="20" :xl="20">
        <!--工具栏-->
        <div class="head-container">
          <!-- 搜索 -->
          <el-input v-model="query.value" clearable placeholder="输入关键字搜索" style="width: 200px;" class="filter-item" @keyup.enter.native="toQuery"/>
          <el-button class="filter-item" size="mini" type="success" icon="el-icon-search" @click="toQuery">搜索</el-button>
          <!-- 新增 -->
          <div v-permission="['ADMIN','FILE_ALL','File_CREATE']" style="display: inline-block;margin: 0px 2px;">
            <el-button
              class="filter-item"
              size="mini"
              type="primary"
              icon="el-icon-plus"
              @click="add">新增</el-button>
          </div>
          <!-- 导出 -->
          <div style="display: inline-block;">
            <el-button
              v-permission="['ADMIN']"
              :loading="downloadLoading"
              size="mini"
              class="filter-item"
              type="warning"
              icon="el-icon-download"
              @click="download">下载</el-button>
          </div>
        </div>
        <!--表格渲染-->
        <el-table v-loading="loading" :data="data" size="small" filter-multiple = false style="width: 100%;" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"></el-table-column>
          <el-table-column prop="originName" label="文件名"/>
          <el-table-column prop="fileName" label="文件新名" v-show="false"/>
          <!-- <el-table-column prop="phone" label="文件类型"/> -->
          <el-table-column :show-overflow-tooltip="true" prop="uploader" label="上传者"/>
          <el-table-column label="所属目录">
            <template slot-scope="scope">
              <div>{{ scope.row.fileSort.name }}</div>
            </template>
          </el-table-column>
          <el-table-column label="文件类型" align="center" prop="fileType" >
          </el-table-column>
          <el-table-column :show-overflow-tooltip="true" prop="createTime" label="创建日期">
            <template slot-scope="scope">
              <span>{{ parseTime(scope.row.createTime) }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="checkPermission(['ADMIN','File_ALL','File_EDIT','File_DELETE'])" label="操作" width="125" align="center">
            <template slot-scope="scope">
              <el-button v-permission="['ADMIN','FILE_ALL','FILE_EDIT']" size="mini" type="primary" icon="el-icon-edit" @click="edit(scope.row)"/>
              <el-popover
                v-permission="['ADMIN','FILE_ALL','FILE_DELETE']"
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
      </el-col>
    </el-row>
  </div>
</template>

<script>
import checkPermission from '@/utils/permission'
import initData from '@/mixins/initData'
import initDict from '@/mixins/initDict'
import { del,download } from '@/api/file'
import { getFileSorts } from '@/api/fileSort'
import { parseTime } from '@/utils/index'
import eForm from './form'
export default {
  components: { eForm },
  mixins: [initData, initDict],
  data() {
    return {
      height: document.documentElement.clientHeight - 180 + 'px;', isAdd: false,
      delLoading: false, fileSortName: '', fileSorts: [], fileSortId: null,
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      downloadLoading: false,
      multipleSelection : []
    }
  },
  created() {
    this.getFileSortDatas()
    this.$nextTick(() => {
      this.init()
      // 加载数据字典
      this.getDict('user_status')
    })
  },
  mounted: function() {
    const that = this
    window.onresize = function temp() {
      that.height = document.documentElement.clientHeight - 180 + 'px;'
    }
  },
  methods: {
    parseTime,
    checkPermission,
    beforeInit() {
      this.url = 'api/file'
      const sort = 'id,desc'
      const query = this.query
      const type = query.type
      const value = query.value
      const enabled = query.enabled
      this.params = { page: this.page, size: this.size, sort: sort, fileSortId: this.fileSortId }
      if (type && value) { this.params[type] = value }
      if (enabled !== '' && enabled !== null) { this.params['enabled'] = enabled }
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
    getFileSortDatas() {
      const sort = 'id,desc'
      const params = { sort: sort }
      params['enabled'] = true;
      if (this.fileSortName) { params['name'] = this.fileSortName }
      getFileSorts(params).then(res => {
        this.fileSorts = res.content
      })
    },
    handleNodeClick(data) {
      if (data.pid === 0) {
        this.fileSortId = null
      } else {
        this.fileSortId = data.id
      }
      this.init()
    },
    add() {
      this.isAdd = true
      this.$refs.form.getFileSorts()
      this.$refs.form.dialog = true
    },
    // 下载
    download() {
      if(this.multipleSelection.length<=0){
        this.$message({
              message: '请选择所要下载文件',
              type: 'warning'
            })
            return
      }
      //暂时只让单个文件下载，后续进行改进
      if(this.multipleSelection.length>1){
        this.$message({
              message: '请选择一个文件进行下载',
              type: 'warning'
            })
            return
      }
      var fileNames ="";
      var originName;
      this.multipleSelection.forEach(element => {
        fileNames = element.fileName+","+fileNames;
        originName = element.originName;
      });
      download({fileNames:fileNames}).then(res=>{
        const content = res
      
      this.filename = originName
      const blob = content
      if (window.navigator.msSaveOrOpenBlob) {
        // 兼容IE10
        navigator.msSaveBlob(blob, this.filename)
      } else {
        //  chrome/firefox
        let aTag = document.createElement('a')
        aTag.download = this.filename
        aTag.href = URL.createObjectURL(blob)
        aTag.click()
        URL.revokeObjectURL(aTag.href)
      }

      });
      
    },
    handleSelectionChange(val) {
        this.multipleSelection = val;
        console.log(this.multipleSelection = val);
    },
    // 数据转换
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'createTime' || j === 'lastPasswordResetTime') {
          return parseTime(v[j])
        } else if (j === 'enabled') {
          return parseTime(v[j]) ? '启用' : '禁用'
        } else {
          return v[j]
        }
      }))
    },
    edit(data) {
      this.isAdd = false
      const _this = this.$refs.form
      _this.getFileSorts()
      _this.form = { id: data.id,fileSortId:data.fileSort.id, fileSort: { id: data.fileSort.id }}
      _this.fileShow = false;
      _this.dialog = true
    }
  }
}
</script>

<style scoped>
</style>
