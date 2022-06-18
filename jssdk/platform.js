(function(win) {
	var layerLoading;
	var payInfoBackup;
	var lastOrderNo;
	var payDivIndex;
	var h = function(api, webApi){
		this.init(api, webApi);
	};

	h.prototype = {
		showMsg: function(msg, callback) {
			return this._showMsg(msg, {time: 1000}, callback);
		},
		showSuccessMsg: function(msg, callback) {
			return this._showMsg(msg, {icon: 1, time: 1000, offset:'t'}, callback);
		},
		showErrorMsg: function(msg, callback) {
			return this._showMsg(msg, {icon: 5, time: 1000, shift: 6, offset:'t'}, callback);
		},
		_showMsg: function(msg, data, callback) {
			layui.use(['layer'], function() {
				layer.msg(msg || '', data || {}, callback || function(){});
			})
			return this;
		},
		get: function(url, success, fail, complete) {
			this.request({
				type: 'GET',
				url: url,
				success: success,
				fail: fail,
				complete: complete
			});
		},
		post: function(url, param, success, fail, complete) {
			this.request({
				type: 'POST',
				url: url,
				data: param,
				success: success,
				fail: fail,
				complete: complete
			});
		},
		request: function(option) {
			var p = $.extend(
						{},
						{
							type: 'GET',
							url: '',
							data: {},
							async: true,
							success: function() {},
							fail: function() {},
							complete: function() {}
						}, 
						option
					);
			if (p.data) {
				p.data = this.execParam(p.data);
			}
			$.ajax({
				type: p.type,
				url: p.url,
				data: p.data,
				async: p.async,
				success: function(d) {
					if (d && d.code == 1001) {
						win.location.href = '/members/login?url=' + decodeURIComponent(window.location.href);
						return;
					}
					if (d) {
					 	p.success(d);
					}else{
						p.success({code:11111,msg:msg.unknown,data:''})
					}
				},
				error: function(e) {
					p.fail && p.fail()
				},
				complete: p.complete
			});
		},
		execParam: function(d){
			var url = location.search;
			if (url.indexOf("?") != -1) {  
			   var str = url.substr(1);  
			   strs = str.split("&");  
			   for(var i = 0; i < strs.length; i ++) {
				  	d[strs[i].split("=")[0]]=decodeURI(strs[i].split("=")[1]);
			   }
			}
			url = location.pathname;
			var tag = '/games/';
			if (url.indexOf(tag) != -1) {
				var b = url.substr(url.indexOf(tag) + tag.length);
				if (b && b.length != 0) {
					if (b.indexOf('/') != -1) {
						var r = b.split('/');
						var keys = ['game_id','channel_id'];
						for(var i = 0; i < r.length; i++) {
							if (i < keys.length) {
								d[keys[i]] = r[i];
							}
						}
					}else{
						d.game_id = b;
					}
				}
			}
			if (typeof uid !== 'undefined') {
				d.uid = uid;
			}
			if (typeof channelId !== 'undefined') {
				d.channel_id = channelId;
			}
			return d;
		},
		isAndroid: function() {
			return win.navigator.userAgent.indexOf('XSDK-ANDROID') > -1;
		},
		isIOS: function() {
			return win.navigator.userAgent.indexOf('XSDK-IOS') > -1;
		},
		isWeb: function() {
			return !this.isAndroid() && !this.isIOS();
		},
		isWx: function() {
			return navigator.userAgent.match(/MicroMessenger/i) && !navigator.userAgent.match(/WindowsWechat/i);
		},
		copy: function(obj) {
			if (this.isWeb()) {
				obj.select();
				if (document.execCommand('copy')) {
					document.execCommand('copy');
					this.showSuccessMsg(msg.copy_success);
				}
			}else{
				window.location.href = PlatForm.AppProtocol.FLOATER_GIFT_SCHEME + $(obj).val();
			}
		},
		back: function() {
			this.isWeb() && win.history.back();
			!this.isWeb() && (win.location.href = PlatForm.AppProtocol.H5_CLOSE_SCHEME);
		},
		loginFinish: function(d) {
			if (!PlatForm.isWeb()) {
				var uinfo = {
					user_id: d.aid || 0,
					user_name: d.nickname || '',
					login_time: d.time || 0,
					token: d.atoken || '',
					phone: ''
				}
				win.location.href = PlatForm.AppProtocol.LOGIN_H5_FINISH_SCHEME + JSON.stringify(uinfo)
			}else{
				var url = PlatForm.getUrlParam('url');
				if (url) {
					win.location.href = decodeURIComponent(url);
				}
			}
		},
		getUrlParam: function(paraName) {
			var url = document.location.toString();
			var arrObj = url.split("?");

			if (arrObj.length > 1) {
			　　var arrPara = arrObj[1].split("&");
			　　var arr;

			　　for (var i = 0; i < arrPara.length; i++) {
				arr = arrPara[i].split("=");

				if (arr != null && arr[0] == paraName) {
				　　return unescape(arr[1]);
				}
			　　}
			　　return "";
			}
			else {
			　　return "";
			}
	　　},
		showLoading: function() {
			layerLoading = layer.load(0, {shade: 0.8, offset:'t'});
		},
		hideLoading: function() {
			layer.close(layerLoading);
		},
		getPayment: function(params, cb) {
			var url = this.Api.READY_PAY;
			if (!PlatForm.isWeb() && params) {
				params.wxInstall = typeof isWxInstall != 'undefined' && isWxInstall ? 1 : 0;
			}
			this.post(
				url,
				params,
				function(d) {
					if (d && d.code == 0) {
						cb && cb(true, d.data);
					}else{
						cb && cb(false, d.msg || '');
					}
				}, 
				function(e) {
					cb && cb(false, '');
				}
			);
		},
		calcAmount: function(type, cb) {
			var i = layer.load(1)
			this.post(
			  this.Api.CALC_AMOUNT,
			  {
			  	type: type,
			  	productId: (payInfoBackup && payInfoBackup.productId) || 0,
			  	amount: (payInfoBackup && payInfoBackup.amount) || 0
			  },
			  function(d) {
			    if (d.code == 0) {
			      cb && cb(d.data)
			    } else {
			      PlatForm.showErrorMsg(d.msg);
			      // PlatForm.hidePay()
			    }
			    layer.close(i)
			  }, 
			  function(e) {
			    PlatForm.showErrorMsg(msg.error);
			    layer.close(i)
			  }
			);
		},
		showPayUi: function(d,payments) {
			$('.paymode').empty();
			for(var key in payments) {
				var payment = payments[key].toLowerCase();
				$('.paymode').append('<img style="background-image:url(/Template/images/pay-' + payment + '.png)" alt="" type="' + payment + '" class="' + payment + ' payitem" >');
			}
			layui.use('layer', function() {
				payDivIndex = layui.layer.open({
					type: 1, 
					area: '80%',
					skin: 'dialogs',
					offset: 'auto',
					content: $('#pay_div'), 
					closeBtn: 0, 
					shade: 0, 
					shadeClose: false, 
					title: null,
					success: function(dom, index) {
						$('#pay_div #title').html(msg.goods_title+'：' + d.productName);
						$('#pay_div #price').html(msg.select_pay_mode_please);
						$('#pay_div #qrcode_div').hide();
						payInfoBackup = d;
						$('.payitem').length != 0 && $($('.payitem')[0]).trigger('click');
					},
					cancel: function() {
						PlatForm.hidePay();
					}
				}); 
			});
		},
		showPay: function(d) {
			var loading = layer.load(1)
			this.getPayment(d, function(r, payments) {
				layer.close(loading)
				if (r && payments && payments.length != 0) {
					if (payments.length == 1) {
						PlatForm.pay(payments[0].toLowerCase(),d);
					}else{
						PlatForm.showPayUi(d,payments);
					}
				}else{
					PlatForm.isWeb() && PlatForm.showErrorMsg(payments || msg.not_pay_mode);
					setTimeout(function(){
						!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
					},1000)
				}
			})
		},
		choosePay: function(type, d) {
			if (payInfoBackup) {
				if (d) {
					payInfoBackup = $.extend({},payInfoBackup, d);
				}
				this.pay(type, payInfoBackup);
			}
			payInfoBackup = null;
		},
		payInWx: function(d) {
			if (typeof WeixinJSBridge == "undefined") {
				if(document.addEventListener) {
					document.addEventListener('WeixinJSBridgeReady', onBridgeReady.bind(null, d), false);
				} else if (document.attachEvent) {
					document.attachEvent('WeixinJSBridgeReady', onBridgeReady.bind(null, d)); 
					document.attachEvent('onWeixinJSBridgeReady', onBridgeReady.bind(null, d));
				}
			} else {
			   onBridgeReady(d);
			}
		},
		isMobile: function() {
			return !!window.navigator.userAgent.match(/Mobile/i);
		},
		checkLastOrder: function() {
			if (lastOrderNo) {
				PlatForm.get(
					PlatForm.Api.ORDER_STATUS_QUERY + lastOrderNo,
					function(d) {
						if (d && d.code == 0) {
							if (PlatForm.isWeb()) {
								PlatForm.showSuccessMsg(d.msg, function() {
									clearInterval(orderPolling);
									layer.closeAll();
								})
							}else{
								clearInterval(orderPolling);
								layer.closeAll();
								PlatForm.appPayCb(0, d.order_no || '', d.amount || 0);
							}
						}else{
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						}
					}, 
					function(e) {
						!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
					}
				);
			}
			lastOrderNo = null;
		},
		pay: function(type, payInfos) {
			if (payInfos) {
				payInfos.platform = this.isAndroid() ? 'ANDROID' : this.isIOS() ? 'IOS' : 'WEB';
				payInfos.return_url = window.location.href;
			}
			var loading = layer.load(1)
			if (type.indexOf('wechat') == 0) {
				this.request({
					type: 'POST',
					url: PlatForm.Api.MAKE_ORDER + type,
					data: payInfos,
					async: !PlatForm.isWx() && PlatForm.isMobile() ? false : true,
					success: function(d) {
						layer.close(loading)
						if (d) {
							switch(d.code) {
								case 0:
									!PlatForm.isWeb() && (lastOrderNo = d.data.order_no);
									if (!PlatForm.isWeb()) {
										window.location.href = d.data.url;
									}else{
										window.open(d.data.url, "_blank");	
									}
									break;
								case 2://微信内支付
									PlatForm.payInWx(d.data);
									break;
								case 3://H5支付
									$('body').append(d.data);
									break;
								case 4://扫码支付
									d && d.data && d.data.img && wechatPayQrcode(d.data);
									break;
								default:
									PlatForm.showErrorMsg(d.msg);
									setTimeout(function(){
										!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);	
									},1000)
									break;
							}
						}
					},
					fail: function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				});
			}else if (type.indexOf('alipay') == 0) {
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)
						if (d && d.code) {
							switch(d.code) {
								case 2://手机支付
									if (PlatForm.isWeb()) {
										$('#pay_frame').append('<iframe id="pay_frame_main" frameborder="0" width="100%" height="100%" marginheight="0" marginwidth="0" scrolling="yes"></iframe>');
										$(document.getElementById('pay_frame_main').contentWindow.document.body).append(d.data);
										$('#pay_frame').show();
									}else{
										setTimeout(function(){
											window.location.href = PlatForm.AppProtocol.PAY_H5_SHOW_BACK;
											setTimeout(function(){
												$('body').append(d.data);
											},0)
										},0);
									}
									break;
								case 3://PC支付
									$('body').append(d.data);
									break;
								default:
									PlatForm.showErrorMsg(d.msg);
									setTimeout(function(){
										!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
									},1000)
									break;
							}
						}
					}, 
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('ipaynow_alipay_h5') == 0) {
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						console.error(d)
						layer.close(loading)
						if (d && d.code == 2) {
							$('#pay_frame').append('<iframe id="pay_frame_main" frameborder="0" width="100%" height="100%" marginheight="0" marginwidth="0" scrolling="yes"></iframe>');
							$(document.getElementById('pay_frame_main').contentWindow.document.body).append(d.data);
							$('#pay_frame').show();
						}
					}, 
					function(e) {
						console.error(e)
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('apple') == 0) {
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)
						if (d && d.code == 0) {
							window.location.href = PlatForm.AppProtocol.PAY_APPLE_IAP + JSON.stringify(d.data)
						}else{
							PlatForm.showErrorMsg(d.msg)
							setTimeout(function(){
								!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
							},1000)
						}
					}, 
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('google') == 0) {
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)
						if (d && d.code == 0) {
							window.location.href = PlatForm.AppProtocol.PAY_GOOGLE_IAP + JSON.stringify(d.data)
						}else{
							PlatForm.showErrorMsg(d.msg)
							setTimeout(function(){
								!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
							},1000)
						}
					}, 
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('payssion') == 0 || type.indexOf('mycard') == 0) {
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)
						if (d && d.code) {
							switch(d.code) {
								case 2://手机支付
									if (PlatForm.isWeb()) {
										$('#pay_frame').append('<iframe id="pay_frame_main" src="' + d.data + '" frameborder="0" width="100%" height="100%" marginheight="0" marginwidth="0" scrolling="yes"></iframe>');
										$('#pay_frame').show();
									}else{
										setTimeout(function(){
											window.location.href = PlatForm.AppProtocol.PAY_H5_SHOW_BACK;
											setTimeout(function(){
												window.location.href = d.data || ''
											},0)
										},0);
									}
									break;
								case 3://PC支付
									window.location.href = d.data || ''
									break;
								default:
									PlatForm.showErrorMsg(d.msg);
									setTimeout(function(){
										!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
									},1000)
									break;
							}
						}else{
							d.msg && PlatForm.showErrorMsg(d.msg);
							setTimeout(function(){
								!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
							},1000)
						}
					},
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('wyp_visa') == 0){
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)
						if (d && d.code) {
							switch(d.code) {
								case 2://App
									if (d.data) {
										!PlatForm.isWeb() && (lastOrderNo = d.data.order_no);
										setTimeout(function(){
											window.location.href = PlatForm.AppProtocol.PAY_H5_SHOW_BACK;
											setTimeout(function(){
												window.location.href = PlatForm.AppProtocol.PAY_OPEN_BROWER + encodeURIComponent(d.data.url)
											},0)
										},0);
									}else{
										PlatForm.showErrorMsg(d.msg);
										setTimeout(function(){
											!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
										},1000)
									}
									break;
								case 3://PC手机支付
									$('#pay_frame').append('<iframe id="pay_frame_main" src="' + d.data.url + '" frameborder="0" width="100%" height="100%" marginheight="0" marginwidth="0" scrolling="yes"></iframe>');
									$('#pay_frame').show();
									checkOrderStatus(d.data.order_no);
									break;
								default:
									PlatForm.showErrorMsg(d.msg);
									setTimeout(function(){
										!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
									},1000)
									break;
							}
						}else{
							d.msg && PlatForm.showErrorMsg(d.msg);
							setTimeout(function(){
								!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
							},1000)
						}
					},
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('paypal') == 0){
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)
						if (d && d.code == 0) {
							if (d.data) {
								setTimeout(function(){
									!PlatForm.isWeb() && (window.location.href = PlatForm.AppProtocol.PAY_H5_SHOW_BACK);
									setTimeout(function(){
										window.location.href = d.data
									},0)
								},0);
							}else{
								PlatForm.showErrorMsg(d.msg);
								setTimeout(function(){
									!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
								},1000)
							}
						}else{
							d.msg && PlatForm.showErrorMsg(d.msg);
							setTimeout(function(){
								!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
							},1000)
						}
					},
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}else if (type.indexOf('icbc') == 0){
				this.post(
					this.Api.MAKE_ORDER + type,
					payInfos,
					function(d) {
						layer.close(loading)




						if (d && d.code) {
							switch(d.code) {
								case 2://手机支付
									if (PlatForm.isWeb()) {
										$('#pay_frame').append('<iframe id="pay_frame_main" frameborder="0" width="100%" height="100%" marginheight="0" marginwidth="0" scrolling="yes"></iframe>');
										$(document.getElementById('pay_frame_main').contentWindow.document.body).append(d.data);
										$('#pay_frame').show();
									}else{
										setTimeout(function(){
											window.location.href = PlatForm.AppProtocol.PAY_H5_SHOW_BACK;
											setTimeout(function(){
												$('body').append(d.data);
											},0)
										},0);
									}
									break;
								case 3://PC支付
									$('body').append(d.data);
									break;
								default:
									PlatForm.showErrorMsg(d.msg);
									setTimeout(function(){
										!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
									},1000)
									break;
							}
						}
					},
					function(e) {
						layer.close(loading)
						setTimeout(function(){
							!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
						},1000)
					}
				);
			}
			else{
				layer.close(loading)
				PlatForm.showErrorMsg(msg.not_this_pay_mode)
				setTimeout(function(){
					!PlatForm.isWeb() && PlatForm.appPayCb(1, '', 0);
				},1000)
			}
		},
		hidePay: function() {
			payDivIndex && layer.close(payDivIndex)
			$('#pay_frame').hide();
	        $('#pay_frame_main').remove();
	        this.closePage();
			orderPolling && clearInterval(orderPolling);
		},
		closePage: function() {
			if (!this.isWeb()) {
	        	window.location.href = PlatForm.AppProtocol.H5_CLOSE_SCHEME;
	        }
		},
		checkVersionUpdate: function() {
			if (!this.isWeb()) {
				window.location.href = PlatForm.AppProtocol.FLOATER_CHECK_UPGRADE_SCHEME;
			}
		},
		reportPlayer: function(param) {
			this.post(
				this.Api.REPORT_PLAYER,
				param,
				function(d) {
					if (d.code == 0) {
						console.log(d.msg);
					} else {
						PlatForm.showErrorMsg(d.msg);
					}
				}, 
				function(e) {

				}
			);
		},
		appPayCb: function(code, orderNo, amount) {
			window.location.href = PlatForm.AppProtocol.PAY_H5_FINISH_SCHEME + '{"code":'+code+', "orderNo":"'+orderNo+'","amount":'+amount+'}';
		},
		logout: function(param) {
			this.post(
				this.Api.LOGOUT,
				{},
				function(d) {
					if (d.code == 0) {
						// var a={opType: 'fn', value: {args: [], fn: 'logout'}};
						// document.getElementById("game_frame")&&document.getElementById("game_frame").contentWindow&&document.getElementById("game_frame").contentWindow.postMessage(a,"*");
						if (PlatForm.isWeb()) {
							win.location.href = '/members/login?url=' + win.location.href;
						}else{

						}
					} else {
						PlatForm.showErrorMsg(d.msg);
					}
				}, 
				function(e) {

				}
			);
		},
		initSdk: function() {
			if (typeof window.postMessage != 'undefined') {
				if(window.addEventListener) {
					window.addEventListener('message', messageHandler, false);
				} else if (window.attachEvent) {
					window.attachEvent('onmessage',messageHandler);
				}
			}
		},
		init: function(api, webApi) {
			this.Api = {
				BASE_API: api,
				BASE_WEB_API: webApi,
				SMS_CODE_LOGIN: '/smscode/login',
				SMS_CODE_REGISTER: '/smscode/register',
				ACCOUNT_LOGIN: '/members/login/account',
				LOGIN_USER: '/members/login/user',
				MOBILE_LOGIN: '/members/login/mobile',
				ACCOUNT_REGISTER: '/members/register/account',
				MOBILE_REGISTER: '/members/register/mobile',
				CERTIFICATION: '/members/certification',
				PASSWORD: '/members/password',
				GET_GIFT: '/gifts/receive',
				MAKE_ORDER: '/orders/',
				READY_PAY: '/payments',
				ORDER_STATUS_QUERY: '/orders/state/',
				REPORT_PLAYER: '/game_players',
				LOGOUT: '/members/logout',
				ORDER_LIST: '/orders/list',
				CALC_AMOUNT: '/calc',
				GIFT_LIST: '/gifts/list',
				SHARE_LIST: '/share/list'
			}
		},
		Api: {},
		AppProtocol: {
			FLOATER_IDENTITY_SCHEME: 'zqhdfloater://user_info/identity/',
			FLOATER_UPDATE_TOKEN_SCHEME: 'zqhdfloater://user_info/update_token/',
			FLOATER_SHOW_TIPS_SCHEME: 'zqhdfloater://user_info/show_tips/',
			FLOATER_ORDER_SCHEME: 'zqhdfloater://order/id/copy/',
			FLOATER_GIFT_SCHEME: 'zqhdfloater://gift/redeem_code/copy/',
			FLOATER_CHECK_UPGRADE_SCHEME: 'zqhdfloater://setting/check_upgrade/',
			FLOATER_SWITCH_ACCOUNT_SCHEME: 'zqhdfloater://setting/switch_account/',
			PAY_H5_FINISH_SCHEME: 'zqhdpay://pay/',
			H5_CLOSE_SCHEME: 'zqhd://close/',
			PAY_H5_SHOW_BACK: 'zqhd://show_back/',
			LOGIN_H5_FINISH_SCHEME: 'zqhdlogin://login/',
			PAY_OPEN_BROWER: 'zqhd://open_brower/',
			PAY_APPLE_IAP: 'zqhdpay://pay_apple_iap/',
			PAY_GOOGLE_IAP: 'zqhdpay://pay_google_iap/'
		}
	};

	function onBridgeReady(d) {
		WeixinJSBridge.invoke('getBrandWCPayRequest', {
			"appId": d.appId,
			"timeStamp": d.timeStamp + '',
			"nonceStr": d.nonceStr,
			"package": d.package,
			"signType": d.signType,
			"paySign": d.paySign
		},
		function(res) {
		   if(res.err_msg == "get_brand_wcpay_request：ok" ) {}
		});
	}

	/**
	 * 弹出微信扫码支付
	 */
	function wechatPayQrcode(d){
		$('#qrcode_div #qrcode').attr('src', d.img);
		layui.use('form', function() {
			layer_wechat_qrcode = layui.layer.open({
				type: 1, 
				skin: 'dialogs',
				content: $('#qrcode_div'), 
				closeBtn: 2, 
				shade: 0.8,
				shadeClose: false, 
				area: '15rem',
				title: null,
				cancel: function(index, layero) { 
					clearInterval(orderPolling);
				}
			});
		});
		checkOrderStatus(d.order_no);
	}

	var orderPollingNum = 0, orderPollingNumMax = 60, orderPollingNumInterval = 5000, orderPolling;
	function checkOrderStatus(orderNo) {
		orderPollingNum = 0;
		orderPolling && clearInterval(orderPolling);
		orderPolling = setInterval(pollingOrder.bind(null, orderNo), orderPollingNumInterval);
	}

	function pollingOrder(orderNo){
		orderPollingNum++;
		if (orderPollingNum > orderPollingNumMax) {
			clearInterval(orderPolling);
			PlatForm.hidePay()
			layer.closeAll();
			return;
		}

		PlatForm.get(
			PlatForm.Api.ORDER_STATUS_QUERY + orderNo,
			function(d) {
				if (d && d.code == 0) {
					if (PlatForm.isWeb()) {
						PlatForm.showSuccessMsg(d.msg, function() {
							clearInterval(orderPolling);
							layer.closeAll();
							PlatForm.hidePay()
						})
					}else{
						clearInterval(orderPolling);
						layer.closeAll();
						PlatForm.appPayCb(0, d.order_no || '', d.amount || 0);
					}
				}
			}, 
			function(e) {

			}
		);
	}

	function appPayCb(code, orderNo, amount) {
		window.location.href = PlatForm.AppProtocol.PAY_H5_FINISH_SCHEME + '{"code":0, "orderNo":"'+orderNo+'","amount":'+amount+'}';
	}

	function messageHandler(e) {
		switch(e.data.op)
		{
			//支付
			case 'pay':
				PlatForm.showPay(e.data.params);
				break;

			case 'logout':
				PlatForm.logout();
				break;

			//上报游戏角色
			case 'reportLogin':
			case 'reportCreatePlayer':
			case 'reportLevelUp':
				var types = {reportCreatePlayer: 1, reportLogin: 2, reportLevelUp: 3};
				e.data.params.type = types[e.data.op];
				PlatForm.reportPlayer(e.data.params);
				break;

			//关闭支付iframe
			case 'ClosePayIframe':
				$('#pay_frame').hide();
	        	$('#pay_frame_main').remove();
	        	if (PlatForm.isWeb()) {
					PlatForm.showSuccessMsg(msg.pay_finished);
				}else{
					var orderNo = PlatForm.getUrlParam('out_trade_no');
					var amount = PlatForm.getUrlParam('amount') * 100;
					PlatForm.appPayCb(0, orderNo, amount);
				}
				break;

			case 'getConfig':
				var a={op: 'setConfigCallback', value: {subscribe: 0, share: 0, shareDialog: 0, logo: 0, customer: 0, customerConfig: [], qq: '', qqGroup: ''}};
				document.getElementById("game_frame")&&document.getElementById("game_frame").contentWindow&&document.getElementById("game_frame").contentWindow.postMessage(a,"*");
				break;

			case 'share':
				// var a={op: 'setShareCallback', value: {status: 0}};
				// document.getElementById("game_frame")&&document.getElementById("game_frame").contentWindow&&document.getElementById("game_frame").contentWindow.postMessage(a,"*");
				break;

			case 'subscribe':
				// var a={op: 'setCheckSubscribeCallback', value: {status: 0}};
				// document.getElementById("game_frame")&&document.getElementById("game_frame").contentWindow&&document.getElementById("game_frame").contentWindow.postMessage(a,"*");
				break;

			case 'getCheckSubscribe':
				var a={op: 'setCheckSubscribeCallback', value: {status: 0}};
				document.getElementById("game_frame")&&document.getElementById("game_frame").contentWindow&&document.getElementById("game_frame").contentWindow.postMessage(a,"*");
				break;

			case 'setShareConfig'://设置分享设置 {title:'',content:''}
				var inviterUid, link;
				if (typeof uid != 'undefined') {
					inviterUid = 'fuid=' + uid;
					link = location.href + (location.href.indexOf('?') == -1 ? "?" + inviterUid : "&" + inviterUid);
				}else{
					link = location.href;
				}
				// link = 'http://test.m.lingleigame.com/games/49/NcGCOJI55OWoi7OiUzBNwttZAJ9O6SrEhMLQJCvdxlsjM1UtNZO11dy5IOtA-42ZAe8?a=1'
				PlatForm.get(
					PlatForm.Api.SHARE_LIST + '?url=' + encodeURIComponent(location.href),
					function(d) {
						if (d && d.code == 0) {
							shareListExec(d.data, e.data.params);
						}else{
							console.log('------'+msg.get_share_fail+'----->' + d);
						}
					}, 
					function(e) {
						console.log('------'+msg.get_share_fail+'----->' + e);
					}
				);
				break;
		}
	}

	function shareListExec(data, shareInfo) {
		if (data && shareInfo) {
			if (data.wx) {
				wx.config({
						debug: false,
						appId: data.wx.appId,
						timestamp: data.wx.timestamp,
						nonceStr: data.wx.nonceStr,
						signature: data.wx.signature,
						jsApiList: [
							"checkJsApi",
							"onMenuShareTimeline",
							"onMenuShareAppMessage",
							"onMenuShareQQ",
							"onMenuShareWeibo",
							"onMenuShareQZone"
							]
						});

						wx.ready(function () {
							var shareData = {
								title: shareInfo.title || '',
								desc: shareInfo.content || '',
								link: data.link || '',
								imgUrl: data.img || '',
								success : function(){
									shareCallback(1);
								},
								cancel: function () {
									shareCallback(0);
								}
							};

							wx.onMenuShareAppMessage(shareData);
							wx.onMenuShareTimeline(shareData);
							wx.onMenuShareQQ(shareData);
							wx.onMenuShareWeibo(shareData);
							wx.onMenuShareQZone(shareData);
						});
			}
		}
	}

	function shareCallback(status){
		var a={op: 'setShareCallback', value: {status: status}};
		document.getElementById('game_frame')&&document.getElementById('game_frame').contentWindow&&document.getElementById('game_frame').contentWindow.postMessage(a,'*');
	}

	// PlatForm.isPortrait = function() {
	//     return win.neworientation.current == 'portrait';
	// }

	// PlatForm.orientationChange = function(cb) {
	//     win.addEventListener('orientationchange', function(){
	//         cb && cb(this.isPortrait())
	//     }, false);
	// }
	win.h = h;

})(window);

/**
 * orientationchange-fix
 * orientationchange修复实用库
 */
// ;
// (function(win) {
//     var meta = {},
//         timer;

//     var eventType = 'orientationchange';
//     // 是否支持orientationchange事件
//     var isOrientation = ('orientation' in window && 'onorientationchange' in window);
//     meta.isOrientation = isOrientation;

//     // font-family
//     var html = document.documentElement,
//         hstyle = win.getComputedStyle(html, null),
//         ffstr = hstyle['font-family'];
//     meta.font = ffstr;

//     // automatically load css script
//     function loadStyleString(css) {
//         var _style = document.createElement('style'),
//             _head = document.head ? document.head : document.getElementsByTagName('head')[0];
//         _style.type = 'text/css';
//         try {
//             _style.appendChild(document.createTextNode(css));
//         } catch (ex) {
//             // lower IE support, if you want to know more about this to see http://www.quirksmode.org/dom/w3c_css.html
//             _style.styleSheet.cssText = css;
//         }
//         _head.appendChild(_style);
//         return _style;
//     }

//     // 触发原生orientationchange
//     var isSupportCustomEvent = window.CustomEvent ? true : false,
//         fireEvent;
	
//     // https://github.com/krambuhl/custom-event-polyfill/blob/master/custom-event-polyfill.js
//     // Polyfill for creating CustomEvents on IE9/10/11
//     if (isSupportCustomEvent) {
//         try {
//             var ce = new window.CustomEvent('test');
//             ce.preventDefault();
//             if (ce.defaultPrevented !== true) {
//                 // IE has problems with .preventDefault() on custom events
//                 // http://stackoverflow.com/questions/23349191
//                 throw new Error('Could not prevent default');
//             }
//         } catch (e) {
//             var CustomEvent = function(event, params) {
//                 var evt, origPrevent;
//                 params = params || {
//                     bubbles: false,
//                     cancelable: false,
//                     detail: undefined
//                 };

//                 evt = document.createEvent("CustomEvent");
//                 evt.initCustomEvent(event, params.bubbles, params.cancelable, params.detail);
//                 origPrevent = evt.preventDefault;
//                 evt.preventDefault = function() {
//                     origPrevent.call(this);
//                     try {
//                         Object.defineProperty(this, 'defaultPrevented', {
//                             get: function() {
//                                 return true;
//                             }
//                         });
//                     } catch (e) {
//                         this.defaultPrevented = true;
//                     }
//                 };
//                 return evt;
//             };

//             CustomEvent.prototype = window.Event.prototype;
//             window.CustomEvent = CustomEvent; // expose definition to window
//         }
//     }

//     fireEvent = isSupportCustomEvent ? function(element, eventName, params) {
//         var evt = document.createEvent('CustomEvent');
//         if (params) {
//             evt.initCustomEvent(eventName, params.bubbles, params.cancelable, params.detail);
//         } else {
//             evt.initCustomEvent(eventName, false, false, void(0));
//         }
//         if (element.dispatchEvent) {
//             element.dispatchEvent(evt);
//         }
//         return evt;
//     } : function(element, eventName, params) {
//         var evt = document.createEventObject();
//         evt.type = eventName;
//         if (params) {
//             evt.bubbles = Boolean(params.bubbles);
//             evt.cancelable = Boolean(params.cancelable);
//             evt.detail = params.detail;
//         } else {
//             evt.bubbles = false;
//             evt.cancelable = false;
//             evt.detail = void(0);
//         }
//         // fire
//         if (element[eventName]) {
//             element[eventName](evt);
//         } else if (element['on' + eventName]) {
//             element['on' + eventName](evt);
//         } else if (element.fireEvent && ('on' + eventName) in element) { //针对IE8及以下版本，fireEvent|attachEvent|detachEvent只能使用如下事件名
//             element.fireEvent('on' + eventName, evt);
//         }
//         return evt;
//     };


//     // callback
//     var orientationCB = function(e) {
//         if (win.orientation === 180 || win.orientation === 0) {
//             meta.init = 'portrait';
//             meta.current = 'portrait';
//         }
//         if (win.orientation === 90 || win.orientation === -90) {
//             meta.init = 'landscape';
//             meta.current = 'landscape';
//         }
//         return function() {
//             if (win.orientation === 180 || win.orientation === 0) {
//                 meta.current = 'portrait';
//             }
//             if (win.orientation === 90 || win.orientation === -90) {
//                 meta.current = 'landscape';
//             }
//             fireEvent(window, eventType);
//         }
//     };
//     var resizeCB = function() {
//         var pstr = "portrait, " + ffstr,
//             lstr = "landscape, " + ffstr,
//             cssstr = '@media (orientation: portrait) { .orientation{font-family:' + pstr + ';} } @media (orientation: landscape) {  .orientation{font-family:' + lstr + ';}}';

//         // 载入样式     
//         loadStyleString(cssstr);
//         // 添加类
//         html.className = 'orientation ' + html.className;
//         if (hstyle['font-family'] === pstr) { //初始化判断
//             meta.init = 'portrait';
//             meta.current = 'portrait';
//         } else {
//             meta.init = 'landscape';
//             meta.current = 'landscape';
//         }
//         resizeCB = function() {
//             if (hstyle['font-family'] === pstr) {
//                 if (meta.current !== 'portrait') {
//                     meta.current = 'portrait';
//                     fireEvent(window, eventType);
//                 }
//             } else {
//                 if (meta.current !== 'landscape') {
//                     meta.current = 'landscape';
//                     fireEvent(window, eventType);
//                 }
//             }
//         }
//     };
//     var callback = isOrientation ? orientationCB() : (function() {
//         resizeCB();
//         return function() {
//             timer && win.clearTimeout(timer);
//             timer = win.setTimeout(resizeCB, 300);
//         }
//     })();

//     // 监听
//     win.addEventListener(isOrientation ? 'orientationchange' : 'resize', callback, false);

//     win.neworientation = meta;
// })(window);