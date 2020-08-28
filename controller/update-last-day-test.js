module.exports = function () {
    return new Promise((res, rej) => {
        try {
            setTimeout(() => {
                res("Test")
            }, 1000)
        } catch (error) {
            rej(error.message)
        }
    })
}
