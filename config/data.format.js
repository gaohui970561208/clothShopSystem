class Result {
    constructor (code = 0, msg = '', data) {
        this.code = code;
        this.data = data;
        this.msg = msg;
    }
}

export default Result;