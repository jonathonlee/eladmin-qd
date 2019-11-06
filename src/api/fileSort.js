import request from '@/utils/request'

export function getFileSorts(params) {
  return request({
    url: 'api/fileSort',
    method: 'get',
    params
  })
}

export function add(data) {
  return request({
    url: 'api/fileSort',
    method: 'post',
    data
  })
}

export function del(id) {
  return request({
    url: 'api/fileSort/' + id,
    method: 'delete'
  })
}

export function edit(data) {
  return request({
    url: 'api/fileSort',
    method: 'put',
    data
  })
}
