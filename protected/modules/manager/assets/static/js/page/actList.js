define(function(require, exports, module){
	// 活动列表
	var $ = require('$'),
		common = require('common'),
		dialogUi = require('dialogUi'),
		main = require('main'),
		server = require('server'),
		static = require('static');
	var roleConfig = {
		baseDefault: function() {
			if (roleType == 1 || roleType == 102) return 1;
			if (roleType == 11 || roleType == 101) return 2;
		},
		changeText: function() {
			if (!roleType) return false;
			if (roleType == 1 || roleType == 102) return '修改';
			if (roleType == 11 || roleType == 101) return '查看';
		}
	}

	var pageManager = common.pageManager,
		PagTable = common.PagTable,
		myValidate = common.myValidate,
		regexp = myValidate.regexp;

	var tip = main.tip,
		wait = main.wait;

	// 更新活动
	var updateActView = (function() {
		pageManager.add({name: 'awrap', el: $('#actWrap'), parent: $('#secondPanel')});
		function init(el) {
			$('#actWrap').html(el);
		}
		function _render(data) {
			pageManager.show('awrap');
		}
		return { render: _render, init: init};
	})()

	// 基础数据列表视图
	var baseDataView = (function(){ // 单个活动收藏数 | 单个活动分享数 | 单个活动报名情况 | 签到 | 评论
		var El = $('<div></div>');
		var serverConfig = {
			share: server.sharesAct,
			collection: server.lovsAct,
			registration: server.enrollsAct,
			comment: server.commentsAct,
			checkin: server.checkinsAct
		};
		pageManager.add({name: 'cm', el: $('#operateWrap'), parent: $('#secondPanel')});

		function renderCheckinTable(parms) {
			return table = PagTable({
				ThList: ['编号', '是否达人', '昵称', '姓名', '电话', '通信地址', '签到时间'],
				columnNameList: [
					'index', 
					function(data) {
						return data.is_vip == 1 ? '是' : '否';
					}
					, 'nick_name', 'real_name', 'contact_phone', 'address', 'checkin_time'
				],
				source: function(o, pag, table) {
					dialog = wait();
					parms.page = o.currentPage;
					parms.size = static.actsPerNum;
					serverConfig.checkin(parms, function(resp){
						/*resp = {
							code: 0,
							body: {
								s_users: [{nick_name: 4}],
								total_num: 1
							}
						};*/
						dialog.hide();
						if (resp.code == 0) {
							if (resp.body.s_users.length) {
								pag({totalPage: Math.ceil(resp.body.total_num/static.actsPerNum)});
							}
							table(resp.body.s_users);
						} else {
							tip(resp.msg || '查询数据列表出错');
						}
					})
				},
				perPageNums: static.actsPerNum
			});
		}	
		function renderCommonTable(parms, type) {
			return table = PagTable({
				ThList: ['编号', '是否达人', '昵称', '姓名', '电话', '通信地址', '签到时间'],
				columnNameList: [
					'index', 
					function(data) {
						return data.is_vip == 1 ? '是' : '否';
					}
					, 'nick_name', 'real_name', 'contact_phone', 'address', 'checkin_time'
				],
				source: function(o, pag, table) {
					dialog = wait();
					parms.page = o.currentPage;
					parms.size = static.actsPerNum;
					serverConfig[type](parms, function(resp){
						/*resp = {
							code: 0,
							body: {
								s_users: [{nick_name: 3}],
								total_num: 1
							}
						};*/
						dialog.hide();
						if (resp.code == 0) {
							if (resp.body.s_users.length) {
								pag({totalPage: Math.ceil(resp.body.total_num/static.actsPerNum)});
							}
							table(resp.body.s_users);
						} else {
							tip(resp.msg || '查询数据列表出错');
						}
					})
				},
				perPageNums: static.actsPerNum
			});
		} 
		function renderCommentTable(parms) {
			return table = PagTable({
				ThList: ['编号', '是否达人', '昵称', '姓名', '电话', '通信地址', '签到时间'],
				columnNameList: [
					'index', 
					function(data) {
						return data.is_vip == 1 ? '是' : '否';
					}
					, 'nick_name', 'real_name', 'contact_phone', 'address', 'checkin_time'
				],
				source: function(o, pag, table) {
					dialog = wait();
					parms.page = o.currentPage;
					parms.size = static.actsPerNum;
					//serverConfig.comment(parms, function(resp){
						resp = {
							code: 0,
							body: {
								comments: [{nick_name: 3}],
								total_num: 1
							}
						};
						dialog.hide();
						if (resp.code == 0) {
							if (resp.body.comments.length) {
								pag({totalPage: Math.ceil(resp.body.total_num/static.actsPerNum)});
							}
							table(resp.body.comments);
						} else {
							tip(resp.msg || '查询数据列表出错');
						}
					//})
				},
				perPageNums: static.actsPerNum
			});
		} 		
		function _render(parms, type) {
			var table;
			if (type == 'checkin') {
				table = renderCheckinTable(parms);
			} else if (~$.inArray(type, ['share', 'collection', 'registration'])) {
				table = renderCommonTable(parms, type);
			} else if(type == 'comment') {
				table = renderCommentTable(parms);
			}
			El.html(table.El);
			pageManager.render('cm', El);
		}
		return {
			render: _render
		}
	})()

	var actsDetailView = (function() {
		function HTMLDecode(text)
		{
			var temp = document.createElement("div");
			temp.innerHTML = text;
			var output = temp.innerText || temp.textContent;
			temp = null;
			return output;
		}

		function render(data, fn) {
			var El, html;
			El = $('<div></div>');
			html = template.render('active_add_Template', data);
			El.html(html);
			pageManager.render('awrap', El);
			El.find('#myEditor').html(HTMLDecode(data.detail_all));
			El.find('#edit').click(function(){
				if (~$.inArray(Number(data.status), [0, 3, 4, 6])) {
					page.enterEdit(data, fn);
				} else {
					tip('该活动无法修改');
				}
			});
		}

		return {
			render: render
		}
	})()

	// 添加关联依赖的列表视图
	var DetailTableListView = function(settings) {
		var defaultSettings = {parms: {}};
		$.extend(this, defaultSettings, settings);
		this.initialize();
	}
	DetailTableListView.prototype = {
		constructor: DetailTableListView,
		initialize: function() {
			this.El = $(	'<div class="p10">' +
					'<div>' +
						'<input type="text" class="ui-input" id="searchInput" />' + 
						'<a href="javascript:;" id="searchBtn" class="ui-button ui-button-ldarkblue ml20">搜索</a>' +
						'<div id="loadWrap" class="mt20 tc"></div>' + 
					'</div>'+
					'<div class="mt10" id="tablecontainer"></div>' + 
				'</div>');
			this.dialog = new Dialog({
							content: this.El[0]
							//closeTpl: false
							//height: 180,
							//width: 300
						});
			this.render();
			this.setEvents();
		},
		thListConfig: {
			strategy: ['编号', '攻略名称', '添加'],
			memory: ['编号', '回顾名称', '添加'],
			vips: ['编号', '达人名称', '添加']
		},
		serverAjaxConfig: {
			strategy: server.news,
			memory: server.news,
			vips: server.vips   /* ??? */
		},
		setEvents: function() {
			var that = this;
			this.El.find('#searchBtn').click(function(){
				var keyWords = that.El.find('#searchInput').val();
				that.render({keyWords: keyWords});
			})			
		},
		render: function(parms) {
			this.table = this.renderTable(this.getParms(parms));
			this.El.find('#tablecontainer').html(this.table.El);
			this.dialog.show();
		},
		getParms: function(parms) {
			var parms = parms || {};
			return $.extend(this.parms, parms);
		},
		showLoad: function() {
			this.El.find('#loadWrap').html('<a href="javascript:;" class="load-wrap"></a>');
		},
		closeLoad: function() {
			this.El.find('#loadWrap').html('');
		},
		renderTable: function(parms) {
			var that = this;
			return table = PagTable({
				ThList: that.thListConfig[that.type],
				columnNameList: [
					'index', 
					function(data) {
						if (~$.inArray(that.type, ['strategy', 'memory'])) {
							return data.title;
						} else if (that.type == 'vips') {
							return data.real_name;
						}
					},
					function(data){
						return '<a id="setSel" href="javascript:;" >添加</a>';
					}
				],
				source: function(o, pag, table) {
					parms.page = o.currentPage;
					parms.size = 20;
					that.showLoad();
					that.serverAjaxConfig[that.type](parms, function(resp){
						that.closeLoad();
						if (resp.code == 0) {
							if (~$.inArray(that.type, ['strategy', 'memory']) && resp.body.news.length) {
								pag({totalPage: Math.ceil(resp.body.total_num/20)});
								table(resp.body.news);
							} else if (that.type == 'vips' && resp.body.users.length) {
								pag({totalPage: Math.ceil(resp.body.total_num/20)});
								table(resp.body.users);
							}
						} else {
							tip(resp.msg || '查询数据列表出错');
						}
					})
				},
				perPageNums: 20
			}, {
				'click #setSel': 'setSel'
			}, {
				setSel: function(e, row) {
					//actHotListView.add(row.data);
					that.selFn(row.data);
					row.destory();
					that.dialog.hide();
				}
			});			
		}
	}

	// 关联列表视图
	var relationView = (function() {
		var El = $('<div></div>');
		function renderStrategyTable(datas, actId) { // 攻略
			return table = PagTable({
				ThList: ['编号', '攻略名称', '查看', '删除'],
				columnNameList: [
					'index', 
					'title',
					function(data) {
						return '<a href="javascript:;" id="watch">查看</a>';
					},
					function(data) {
						return '<a href="javascript:;" id="delete">删除</a>';
					}
				],
				source: datas,
				perPageNums: static.actListPerNum
			}, {
				'click #watch': 'watch',
				'click #delete': 'delete'
			}, {
				watch: function(e, row) {
					alert('watch');
				},
				delete: function(e, row) {
					var dialog = wait();
					server.dealNewAct({actId: actId, newsId: row.data.id, status: -1}, function(resp){
						dialog.destroy();
						if (resp.code == 0) {
							row.destory();
						} else {
							tip ('删除关联失败');
						}
					})
				}
			});
		}
		function renderMemoryTable(datas, actId) {
			return table = PagTable({
				ThList: ['编号', '回忆名称', '查看', '删除'],
				columnNameList: [
					'index', 
					'title',
					function(data) {
						return '<a href="javascript:;" id="watch">查看</a>';
					},
					function(data) {
						return '<a href="javascript:;" id="delete">删除</a>';
					}
				],
				source: datas,
				perPageNums: static.actListPerNum
			}, {
				'click #watch': 'watch',
				'click #delete': 'delete'
			}, {
				watch: function(e, row) { alert('watch');
					//relationView.render();
				},
				delete: function(e, row) {
					var dialog = wait();
					server.dealNewAct({actId: actId, newsId: row.data.id, status: -1}, function(resp){
						dialog.destroy();
						if (resp.code == 0) {
							row.destory();
						} else {
							tip ('删除关联失败');
						}
					})
				}
			});
		}
		function renderVipsTable(datas, actId) {
			return table = PagTable({
				ThList: ['编号', '达人', '性别', '标签', '删除'],
				columnNameList: [
					'index', 
					'real_name',
					function(data) {
						return data.sex == 1 ? '男' : data.sex == 2 ? '女' : '';
					},
					function(data) {
						return '<a href="javascript:;" id="watch">查看</a>';
					},
					function(data) {
						return '<a href="javascript:;" id="delete">删除</a>';
					}
				],
				source: datas,
				perPageNums: static.actListPerNum
			}, {
				'click #watch': 'watch',
				'click #delete': 'delete'
			}, {
				watch: function(e, row) { alert('watch');
					//relationView.render();
				},
				delete: function(e, row) {
					var dialog = wait();
					server.dealVipAct({actId: actId, vipId: row.data.id, status: -1}, function(resp){
						dialog.destroy();
						if (resp.code == 0) {
							row.destory();
						} else {
							tip ('删除关联失败');
						}
					})
				}
			});
		}
		function syncData(serverAjax, parms, fn) { 
			parms.page = 1;
			parms.size = static.actsPerNum;
			serverAjax(parms, fn);
		}
		function _render(actId) {
			var html, strategyTable, memoryTable, vipsTable,
				strategyListView, memoryListView, vipsListView;
			html = template.render('relation_Template');
			El.html(html);
			pageManager.render('cm', El);
			syncData(server.newsAct, {actId: actId, typeId: 1}, function(resp){
				if (resp.code == 0 && resp.body.news) {
					strategyTable = renderStrategyTable(resp.body.news, actId);
					$('#strategyRalation').html(strategyTable.El);
				}
			})
			syncData(server.newsAct, {actId: actId, typeId: 2}, function(resp){
				if (resp.code == 0 && resp.body.news) {
					memoryTable = renderMemoryTable(resp.body.news, actId);
					$('#memoryRalation').html(memoryTable.El);
				}
			})
			syncData(server.vipsAct, {actId: actId, cityId: page.cityId}, function(resp){
				if (resp.code == 0 && resp.body.vips) {
					vipsTable = renderVipsTable(resp.body.vips, actId);
					$('#vipsRalation').html(table.El);
				}
			})
			El.find('#strategyAdd').click(function(){
				if (strategyTable) {
					var table = strategyTable.table;
					if (table.getLength() >= 1) {
						tip ('最多只能添加一个攻略');
					} else {
						if (!strategyListView) {
							var strategyListView = new DetailTableListView({
								parms: {cityId: page.cityId, typeId: 1},
								type: 'strategy',
								selFn: function(data) {
									var dialog = wait();
									server.dealNewAct({actId: actId, newsId: data.id, status: 0}, function(resp){
										if (resp.code == 0) {
											dialog.destroy();
											strategyTable.table.refresh([data]);
										} else {
											tip ('添加关联失败');
										}
									})
								}
							});							
						} else {
							strategyListView.render();
						}
						// strategyTable.table.refresh([{id: 444, title:456}]);
					}
				}
			})
			El.find('#memoryAdd').click(function(){
				if (memoryTable) {
					var table = memoryTable.table;
					if (table.getLength() >= 1) {
						tip ('最多只能添加一个活动回顾');
					} else {
						if (!memoryListView) {
							var memoryListView = new DetailTableListView({
								parms: {cityId: page.cityId, typeId: 2},
								type: 'memory',
								selFn: function(data) {
									var dialog = wait();
									server.dealNewAct({actId: actId, newsId: data.id, status: 0}, function(resp){
										if (resp.code == 0) {
											dialog.destroy();
											memoryTable.table.refresh([data]);
										} else {
											tip ('添加关联失败');
										}
									})
								}
							});							
						} else {
							memoryListView.render();
						}
						// memoryTable.table.refresh([{id: 444, title:456}]);
					}
				}
			})
			El.find('#vipsAdd').click(function(){
				if (vipsTable) {
					var table = vipsTable.table;
					if (table.getLength() >= 4) {
						tip ('最多只能添加4个达人推荐');
					} else {
						if (!vipsListView) {
							var vipsListView = new DetailTableListView({
								parms: {cityId: page.cityId},
								type: 'vips',
								selFn: function(data) {
									var dialog = wait();
									server.dealVipAct({actId: actId, vipId: data.id, status: 0}, function(resp){
										if (resp.code == 0) {
											dialog.destroy();
											vipsTable.table.addRow(data);
										} else {
											tip ('添加达人关联失败');
										}
									})
								}
							});							
						} else {
							vipsListView.render();
						}
					}
				}
			})
		}
		return {
			render: _render
		}
	})()

	// 活动列表视图
	var actListView = (function() {
		var managersAjax = server.managers,
			cityManagers = server.cityManagers,
			cityOperators = server.cityOperators;
		pageManager.add({name: 'mlist', el: $('#adminListCon'), parent: $('#mainPanel')});
		function renderTable(parms) {
			return table = PagTable({
				ThList: ['编号', '活动名称', '发布时间', '标签', '当前状态', '分享数', '收藏数',
				 '报名数', '拨打电话数', '签到数', '评论数', roleConfig.changeText(), '上/下架', '删除', '二维码', '备注'],
				columnNameList: [
					'index', 
					function(data){
						return '<a class="" href="javascript:;" id="actName">'+data.title+'</a>';
					},
					'publish_time','tag_name',
					function(data){
						return static.tStatus[data.t_status];
					},
					function(data){
						return '<a class="" href="javascript:;" id="shareNum">'+data.shared_num+'</a>';
					},
					function(data){
						return '<a class="" href="javascript:;" id="collectionNum">'+data.loved_num+'</a>';
					},
					function(data){
						return '<a class="" href="javascript:;" id="registrationNum">'+data.enroll_num +'</a>';
					},
					function(){
						return '--';
					},
					function(data){
						return '<a class="" href="javascript:;" id="checkinNum">'+data.checkin_num +'</a>';
					},
					function(data){
						return '<a class="" href="javascript:;" id="commentNum">'+data.comment_num+'</a>';
					},
					function(){
						if (roleConfig.baseDefault() == 1) {
							return '<a class="" href="javascript:;" id="update">修改</a>';	
						} else if  (roleConfig.baseDefault() == 2) {
							return '<a class="" href="javascript:;" id="update">查看</a>';	
						}
					},
					function(data){
						if (data.status) {
							return static.statusText(data.status);
						} else {
							return '-';
						}
					},
					function(){
						return '<a class="" href="javascript:;" id="delete">删除</a>';
					},
					function(){
						return '<a class="" href="javascript:;" id="watchQr">查看</a>';
					},
					function(){
						return '<a class="" href="javascript:;" id="remark">备注</a>';
					}
				],
				source: function(o, pag, table) {
					dialog = wait();
					parms.page = o.currentPage;
					parms.size = static.actListPerNum;
					server.acts(parms, function(resp){
						/*resp = {
							code: 0,
							body: {
								acts: [{title: 3, id: 76}],
								total_num: 1
							}
						};*/
						dialog.hide();
						if (resp.code == 0) {
							if (resp.body.acts.length) {
								pag({totalPage: Math.ceil(resp.body.total_num/static.actListPerNum)});
							}
							table(resp.body.acts);
						} else {
							tip(resp.msg || '查询数据列表出错');
						}
					})
				},
				perPageNums: static.actListPerNum
			}, {
				'click #actName': 'actName',
				'click #shareNum': 'shareNum',
				'click #collectionNum': 'collectionNum',
				'click #registrationNum': 'registrationNum',
				'click #checkinNum': 'checkinNum',
				'click #commentNum': 'commentNum',
				'click #update': 'update',
				'click #remark': 'remark',
				'click #upShelf': 'upShelves',
				'click #downShelf': 'downShelf',
				'click #delete': 'deletes'
			}, {
				actName: function(e, row) {
					relationView.render(row.data.id);
				},
				shareNum: function(e, row) {
					var data = {};
					data.actId = row.data.id;
					data.cityId = page.cityId;
					baseDataView.render(data, 'share');
				},
				collectionNum: function(e, row) {
					var data = {};
					data.actId = row.data.id;
					data.cityId = page.cityId;
					baseDataView.render(data, 'collection');
				},
				registrationNum: function(e, row) {
					var data = {};
					data.actId = row.data.id;
					data.cityId = page.cityId;
					baseDataView.render(data, 'registration');
				},
				checkinNum: function(e, row) {
					var data = {};
					data.actId = row.data.id;
					data.cityId = page.cityId;
					baseDataView.render(data, 'checkin');
				},
				commentNum: function(e, row) {
					var data = {};
					data.actId = row.data.id;
					data.cityId = page.cityId;
					baseDataView.render(data, 'comment');
				},
				update: function(e, row) {
					if (row.data.id) {
						/*var resp = {
							code: 0,
							body: {
								act: {
									title: 'test'
								}
							}
						}*/
						var dialog = wait();
						server.act({actId: row.data.id}, function(resp){
							dialog.destroy();
							if (resp.code == 0) {
								//actsDetailView.render(resp.body.act);
								if (roleConfig.baseDefault() == 1) {
									page.enterEdit(resp.body.act);
								} else if (roleConfig.baseDefault() == 2) {
									actsDetailView.render(resp.body.act);
								}							
							} else {
								tip ('获取活动详情失败');
							}
						})
					}
				},
				upShelves: function(e, row) {
					var dialog = wait();
					server.updateStatusAct({actId: row.data.id, status: 5}, function(resp){
						dialog.destroy();
						if (resp.code == 0) {
							tip('上架成功');
							row.set({status: 5});
							row.refresh();
						} else {
							tip('上架失败');
						}
					})
				},
				downShelf: function(e, row) {
					var dialog = wait();
					server.updateStatusAct({actId: row.data.id, status: 6}, function(resp){
						dialog.destroy();
						if (resp.code == 0) {
							tip('下架成功');
							row.set({status: 6});
							row.refresh();
						} else {
							tip('下架失败');
						}
					})
				},
				deletes: function(e, row) {
					var dialog = wait();
					server.updateStatusAct({actId: row.data.id, status: -1}, function(resp){
						dialog.destroy();
						if (resp.code == 0) {
							tip('删除成功');
							row.set({status: -1});
							row.refresh();
						} else {
							tip('删除失败');
						}
					})
				},
				remark: function(e, row) {
					var remark = require('remark');
					remark(1, row.data.id, function(el){
						pageManager.render('cm', el);
					});
				}
			});
		}	 
		function _render(parms) {
			pageManager.show('mlist');
			var table = renderTable(parms);
			pageManager.render('mlist', table.El);
		}
		return { render: _render };
	})()

	function setEvents() {
		$('#return').click(function(){
			pageManager.show('mlist');
		})
		$('#searchBtn').click(function(){
			var parms = {},
				timeStatus = $('#activeSelect #spanText').attr('value'),
				keyWords = $.trim($('#keyword').val()),
				tagId = $('#tagSelect #spanText').val();
			if (timeStatus != 'all') {
				parms.timeStatus = timeStatus;
			}
			if (tagId != 'all') {
				parms.tagId = tagId;
			}
			parms.keyWords = keyWords;
			parms.cityId = page.cityId;
			actListView.render(parms);
		})
	}
  
  	// 入口
	var page = {
		init: function() {
			page.cityId = main.getCityId();			
			pageManager.hide();
			actListView.render({cityId: page.cityId});
			setEvents();
			page.enterEdit = function(o) {
				updateActView.render();
				activeEdit.load('edit', o);
			}
			// page.enter
			var activeEdit = require('activeEdit')();
			K.Observe.make(activeEdit);
			activeEdit.init(function(el){
				updateActView.init(el);
			})
			activeEdit.on('save', function() {
				// saveCallback && saveCallback();
			})
		}
	}
	page.init();
})