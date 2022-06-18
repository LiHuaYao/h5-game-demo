sdkBase = window.location.protocol + '//' + window.location.host;

var messageHandler = function(e) {
	switch(e.data.op)
	{
		//加载完成
		case 'ready':
			console.log('加载完成');
		break;

		//上报登陆
		case 'reportLogin':

			e.data.params._token = _token;
			e.data.params._extend = _extend;

			$.ajax({
				type: 'POST',
				url: sdkBase + '/game_players',
				dataType: 'json',
				data: e.data.params,
				success:function(res) {
					if (res.code == 0) {
						ZhiQuHDH5v1.submitRoleData(JSON.stringify(res.data));
					} else {
						showErrorMsg(res.msg);
					}
				}
			})
		break;

		//上报创建角色
		case 'reportCreatePlayer':

			e.data.params._token = _token;
			e.data.params._extend = _extend;

			$.ajax({
				type: 'POST',
				url: sdkBase + '/game_players',
				dataType: 'json',
				data: e.data.params,
				success:function(res) {
					if (res.code == 0) {
						ZhiQuHDH5v1.submitRoleData(JSON.stringify(res.data));
					} else {
						showErrorMsg(res.msg);
					}
				}
			})
		break;

		//上报角色升级
		case 'reportLevelUp':

			e.data.params._token = _token;
			e.data.params._extend = _extend;

			$.ajax({
				type: 'POST',
				url: sdkBase + '/game_players',
				dataType: 'json',
				data: e.data.params,
				success:function(res) {
					if (res.code == 0) {
						ZhiQuHDH5v1.submitRoleData(JSON.stringify(res.data));
					} else {
						showErrorMsg(res.msg);
					}
				}
			})
		break;

		//支付
		case 'pay':

			e.data.params._token = _token;
			e.data.params._extend = _extend;

			$.ajax({
				type: 'POST',
				url: sdkBase + '/orders',
				dataType: 'json',
				data: e.data.params,
				success:function(res) {
					if (res.code == 0) {
						ZhiQuHDH5v1.pay(JSON.stringify(res.data));
					} else {
						showErrorMsg(res.msg);
					}
				}
			})
		break;

		//登出
		case 'logout':
			console.log('未实现此接口');
		break;

		//获取配置
		case 'getConfig':
			var val = {
				subscribe: 0,
				share: 0,
				shareDialog: 0,
				logo: 0,
				customer: 0,
				customerConfig: {
					qq: '',
					qqGroup: ''
				}
			};
			var data = {op: 'setConfigCallback', value: val};
			document.getElementById('game_frame').contentWindow.postMessage(data,'*');
		break;

		//设置分享配置
		case 'setShareConfig':
			console.log('未实现此接口');
		break;

		//弹出分享对话框
		case 'share':
			console.log('未实现此接口');
		break;

		//弹出关注对话框
		case 'subscribe':
			console.log('未实现此接口');
		break;

		//检查是否关注
		case 'getCheckSubscribe':
			console.log('未实现此接口');
		break;
		
		//设置屏幕锁住解锁回调
		case 'setLockScreen':
			console.log(e.data.params ? '锁屏' : '解锁');
		break;
		
		default:
	}
}

if (typeof window.postMessage != 'undefined') {
	if(window.addEventListener) {
		window.addEventListener('message', messageHandler, false);
	} else if (window.attachEvent) {
		window.attachEvent('onmessage',messageHandler);
	}
}