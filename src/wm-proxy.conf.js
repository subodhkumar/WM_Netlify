const PROXY_CONFIG = [
    {
        context : [
            "/services",
            "/resources",
            "/j_spring_security_check"
        ],
        // target: "http://localhost:8080/E2",
        // target: "http://pk1frj3hh3vj.cloud.wavemakeronline.com/WMP_Summernote",
        target: "http://pk0bf1sym1dq.cloud.wavemakeronline.com/WMPerfListProj",
        secure: false,
        "changeOrigin": true
    }
]
module.exports = PROXY_CONFIG;