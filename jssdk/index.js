(function(win) {

    const version = '1.0.0',
          file = 'SL-JSSDK',
          ua = win.navigator.userAgent.toLowerCase(),
          callbackTree = []

    function isAndroid() {
        return ua.indexOf('android') > 0
    }

    function isIOS() {
        return /(iphone|ipad|ipod)/.test(ua)
    }
    //判断是否为funciton
    function isFunc(obj) {
        return Object.prototype.toString.call(obj) === '[object Function]'
    }
    // 调用C端方法
    function callAppFunc(method, callback, opts) {
        const cbName = `CB_${method.toUpperCase()}_` + Date.now() + '_' + Math.ceil(Math.random() * 1000)

        if(isFunc(opts)){
            callbackTree[cbName] = opts
            opts = {}
        }else if(isFunc(callback)) {
            callbackTree[cbName] = callback
        }
        //
        opts = Object.assign(opts, {cbName: cbName})
        try {
            if(isIOS()) {
                win.webkit.messageHandlers[method].postMessage(opts)
            }else if(isAndroid()) {
                win.SLJS[method](JSON.stringify(opts))
            }
        }catch(err) {
            console.error(`${file}-callAppFunc-error`, err.message)
        }
        return true
    }
    // 获取回调函数方法
    function getCallback(cbName) {
        return callbackTree[cbName]
    }
    // 这段代码是固定的，必须要放到js中
    function setupWebViewJavascriptBridge(callback) {
        if(win.WebViewJavascriptBridge) {
            return callback(WebViewJavascriptBridge)
        }

        if(win.WVJBCallbacks) {
            return win.WVJBCallbacks.push(callback)
        }
        win.WVJBCallbacks = [callback]
        const WVJBIframe = document.createElement('iframe')
        WVJBIframe.style.display = 'none'
        WVJBIframe.src = 'wvjbscheme://__BRIDGE_LOADED__'
        document.documentElement.appendChild(WVJBIframe)
        setTimeout(() => {
            document.documentElement.removeChild(WVJBIframe)
        }, 0)
    }
    // 暴露对象
    win.sl = {
        // 初始化方法，ios必须执行该方法
        ready() {
            // 与OC交互的所有JS方法都要放在此处注册，才能调用通过JS调用OC或者让OC调用这里的JS
            setupWebViewJavascriptBridge(bridge => {
                bridge.registerHandler('callback', (data, responseCallback) => {
                    win.sl.callback(data.cbName, data)
                    responseCallback('success')
                })
            })
        },
        // 分享
        share(opts = {}, callback) {
            console.log(`${file}-menu`, opts)
            callAppFunc('share', callback, opts)
        },
        // 关闭webview
        close(opts = {}, callback) {
            console.log(`${file}-close`, opts)
            callAppFunc('closeWeb', callback, opts)
        },
        // 游戏
        game: {
            // 登录
            async login(opts = {}, callback) {
                console.log(`${file}-game.login`, opts)
                await callAppFunc('getToken', callback, opts)
            },
            // 开始游戏
            async start(opts = {}, callback) {
                console.log(`${file}-game.start`, opts)
                await callAppFunc('startGame', callback, opts)
            },
            // 记录
            async record(opts = {}, callback) {
                console.log(`${file}-game.record`, opts)
                await callAppFunc('gameRecord', callback, opts)
            }
        },
        //跳转页
        menu(opts = {}, callback) {
            console.log(`${file}-menu`, opts)
            if(!opts.type) {
                console.error(`${file}-menu-error`, '缺少type参数')
                return
            }

            callAppFunc('menuDidClick', callback, opts)
        },
        // 回调方法
        callback(cbName, param = {}) {
            console.info(`${file}-callback-${cbName}`, cbName, param)
            const func = getCallback(cbName)
            console.info(`${file}-callback-func-${func}`, func)
            if(!isFunc(func)) {
                console.error(`${file}-callback-${func}-error`, `${func}方法不存在`)
                return
            }

            if(typeof(param) === 'string') {
                param = JSON.parse(param)
            }

            func(param)

            return true
        },
        version() {
            console.log(`${file}-version:${version}`)
        }
    }
})(window)