import request from '@/utils/request'

export function getFiles(params) {
  return request({
    url: 'api/file',
    method: 'get',
    params
  })
}

export function download(params) {
  return request({
    url: 'api/fileDownload',
    method: 'get',
    responseType: 'blob',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/file',
    method: 'post',
    // headers:{
    //   'Content-Type':'multipart/form-data'
    // },
    data
  })
}

export function del(id) {
  return request({
    url: 'api/file/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/file',
    method: 'put',
    data
  })
}
