import service from '@/utils/request'

export function validateFace(data) {
    return service({
        url: 'cas/faceCheck/checkFace',
        method: 'post',
        data
    })
}