<template>
    <div id="niudan" ontouchstart>

        <loading :show="loading" />

        <div class="niudan mode1" :class="{active: mode === 1}">
            <!-- <div class="diamond" v-if="memberInfo.balance">
                <img src="../../assets/images/game/niudan/mode2/egg_icon_diamond@2x.png" />
                <font>{{memberInfo.balance.diamond}}</font>
            </div> -->
            <button class="close" @click.stop.prevent="close"></button>
            <button class="mode1 active"></button>
            <button class="mode2" @click.stop.prevent="setMode(2)"></button>
            <div class="cover" v-if="sceneInfo.ND_COLOR">
                <span :class="{fly: playing}" v-for="(item, index) in sceneInfo.ND_COLOR.product_pool.slice(0, 11)" :key="index" :style="`backgroundImage: url('${item.pic_url}')`"></span>
            </div>
            <!-- 规则 -->
            <button class="rule" @click.stop.prevent="ruleDrawer"></button>
            <!-- 记录 -->
            <button class="record" @click.stop.prevent="recordDrawer"></button>
            <!-- 收获 -->
            <button class="gain" @click.stop.prevent="gainDrawer"></button>
            <!-- 榜单 -->
            <!-- <button class="rank" @click.stop.prevent="rank"></button> -->
            <!-- 背包 -->
            <button class="basket" @click.stop.prevent="basket"></button>
            <!-- 奖池 -->
            <button class="poll" @click.stop.prevent="pollDrawer"></button>
            <!-- 1次 -->
            <div class="btn left" @click.stop.prevent="play(1)" v-if="sceneInfo.ND_COLOR && sceneInfo.ND_COLOR.diamond">
                <span>扭1次</span>
                <span>
                    <img src="../../assets/images/game/niudan/mode2/egg_icon_diamond_small@2x.png" />
                    <font>{{Number.parseFloat(sceneInfo.ND_COLOR.diamond)}}</font>
                </span>
            </div>
            <!-- 10次 -->
            <div class="btn right" @click.stop.prevent="play(10)" v-if="sceneInfo.ND_COLOR && sceneInfo.ND_COLOR.diamond">
                <span>扭10次</span>
                <span>
                    <img src="../../assets/images/game/niudan/mode2/egg_icon_diamond_small@2x.png" />
                    <font>{{Number.parseFloat(sceneInfo.ND_COLOR.diamond * 10)}}</font>
                </span>
            </div>
        </div>

        <div class="niudan mode2" :class="{active: mode === 2}">
            <!-- <div class="diamond" v-if="memberInfo.balance">
                <img src="../../assets/images/game/niudan/mode2/egg_icon_diamond@2x.png" />
                <font>{{memberInfo.balance.diamond}}</font>
            </div> -->
            <button class="close" @click.stop.prevent="close"></button>
            <button class="mode1" @click.stop.prevent="setMode(1)"></button>
            <button class="mode2 active"></button>
            <div class="cover" v-if="sceneInfo.ND_LUXURY">
                <span :class="{fly: playing}" v-for="(item, index) in sceneInfo.ND_LUXURY.product_pool.slice(0, 11)" :key="index" :style="`backgroundImage: url('${item.pic_url}')`"></span>
            </div>
            <!-- 规则 -->
            <button class="rule" @click.stop.prevent="ruleDrawer"></button>
            <!-- 记录 -->
            <button class="record" @click.stop.prevent="recordDrawer"></button>
            <!-- 收获 -->
            <button class="gain" @click.stop.prevent="gainDrawer"></button>
            <!-- 榜单 -->
            <!-- <button class="rank" @click.stop.prevent="rank"></button> -->
            <!-- 背包 -->
            <button class="basket" @click.stop.prevent="basket"></button>
            <!-- 奖池 -->
            <button class="poll" @click.stop.prevent="pollDrawer"></button>
            <!-- 1次 -->
            <div class="btn left" @click.stop.prevent="play(1)" v-if="sceneInfo.ND_COLOR && sceneInfo.ND_COLOR.diamond">
                <span>扭1次</span>
                <span>
                    <img src="../../assets/images/game/niudan/mode2/egg_icon_diamond_small@2x.png" />
                    <font>{{Number.parseFloat(sceneInfo.ND_LUXURY.diamond)}}</font>
                </span>
            </div>
            <!-- 10次 -->
            <div class="btn right" @click.stop.prevent="play(10)" v-if="sceneInfo.ND_COLOR && sceneInfo.ND_COLOR.diamond">
                <span>扭10次</span>
                <span>
                    <img src="../../assets/images/game/niudan/mode2/egg_icon_diamond_small@2x.png" />
                    <font>{{Number.parseFloat(sceneInfo.ND_LUXURY.diamond * 10)}}</font>
                </span>
            </div>
        </div>

        <!-- 礼物弹窗 -->
        <div class="result" v-if="result.show">
            <div class="content">
                <ul>
                    <li v-for="(item, index) in result.list" :key="index">
                        <span class="name">{{item.name}}x{{item.amount}}</span>
                        <img :src="item.icon_url" />
                        <p>{{$t('game.niudan.value')}} <font>{{Number.parseFloat(item.price * item.amount)}}{{$t('diamond')}}</font></p>
                    </li>
                </ul>
                <div class="btns">
                    <div @click.stop.prevent="result.show = false">确认</div>
                    <div @click.stop.prevent="again">再来一次</div>
                </div>
                <p class="p">中奖礼品已放进 <font @click.stop.prevent="basket">背包</font></p>
            </div>
        </div>
        <drawer class="rule-drawer" title="游戏规则" :display.sync="rule.show">
            <div class="content" v-html="rule.content"></div>
        </drawer>
        <drawer class="record-drawer" title="全服记录" :display.sync="record.show">
            <div class="drawer-list" v-if="record.show">
                <loadable-list ref="record-list" initLoad :loadData="loadRecordData" :page-size="20">
                    <template slot-scope="props">
                        <div class="item" v-for="(item, index) in props.data" :key="index">
                            <img class="avatar" :src="item.member_avatar_url" :alt="item.member_nickname" @click.stop.prevent="go2profile(item.member_id)" />
                            <div>
                                <h6>
                                    <font @click.stop.prevent="go2profile(item.member_id)">{{item.member_nickname}}</font>
                                    <span>{{item.add_time|getTime}}</span>
                                </h6>
                                <p>在 <font>{{item.scene_name}}</font> 扭到{{$t('game.niudan.value')}} <font>{{Number.parseFloat(item.price)}}{{$t('diamond')}}</font>的<font>{{item.product_name}}x1</font><img :src="item.icon_url" :alt="item.product_name" /></p>
                            </div>
                        </div>
                    </template>
                </loadable-list>
            </div>
        </drawer>
        <drawer class="gain-drawer" title="我的收获" :display.sync="gain.show">
            <div class="drawer-list" v-if="gain.show">
                <loadable-list ref="gain-list" initLoad :loadData="loadGainData" :page-size="20">
                    <template slot-scope="props">
                        <div class="item" v-for="(item, index) in props.data" :key="index">
                            <p>在 <font>{{item.scene_name}}</font> 扭到{{$t('game.niudan.value')}}<font> {{Number.parseFloat(item.price)}}{{$t('diamond')}}</font>的<font>{{item.product_name}}x1</font><img :src="item.icon_url" /></p>
                            <span>{{item.add_time|getTime}}</span>
                        </div>
                    </template>
                </loadable-list>
            </div>
        </drawer>
        <drawer class="poll-drawer" title="奖池" :display.sync="poll.show" bgcolor="#F6F7F9">
            <nav>
                <span :class="{active: poll.mode === 0}" @click.stop.prevent="setPollMode(0)">{{$t('game.niudan.mode1')}}</span>
                <span :class="{active: poll.mode === 1}" @click.stop.prevent="setPollMode(1)">{{$t('game.niudan.mode2')}}</span>
            </nav>
            <swiper class="swiper" v-model="poll.mode" :show-dots="false" :min-moving-distance="10000">
                <swiper-item class="swiper-item">
                    <ul v-if="sceneInfo.ND_COLOR">
                        <li v-for="(item, index) in sceneInfo.ND_COLOR.product_pool" :key="index">
                            <img :src="item.icon_url" :alt="item.name" />
                            <h6>{{item.name}}</h6>
                            <p>{{$t('game.niudan.value')}}<font>{{Number.parseFloat(item.price)}}{{$t('diamond')}}</font></p>
                        </li>
                    </ul>
                </swiper-item>
                <swiper-item class="swiper-item">
                    <ul v-if="sceneInfo.ND_LUXURY">
                        <li v-for="(item, index) in sceneInfo.ND_LUXURY.product_pool" :key="index">
                            <img :src="item.icon_url" :alt="item.name" />
                            <h6>{{item.name}}</h6>
                            <p>{{$t('game.niudan.value')}}<font>{{Number.parseFloat(item.price)}}{{$t('diamond')}}</font></p>
                        </li>
                    </ul>
                </swiper-item>
            </swiper>
        </drawer>
    </div>
</template>

<script>
import { Swiper, SwiperItem } from 'vux'
import drawer from '@/components/drawer'
import LoadableList from '@/components/LoadableList'
import loading from '@/components/loading'
import Tools from '@/utils/tools'
import SVGA from 'svgaplayerweb'
import 'animate.css'
export default {
    name: 'niudan',
    components: {
        Swiper,
        SwiperItem,
        drawer,
        LoadableList,
        loading
    },
    data() {
        return {
            loading: true,
            resource: [
                '/static/images/game/niudan/pop_title.png',
                '/static/images/game/niudan/pop_btn_bg@2x.png'
            ],
            svga_url: require('@/assets/images/cry.svga'),
            gameId: 1,
            mode: 1,
            rule: {
                show: false,
                content: ''
            },
            record: {
                show: false,
                list: []
            },
            gain: {
                show: false,
                list: []
            },
            poll: {
                show: false,
                mode: 0
            },
            playing: false,
            playTimer: null,
            memberInfo: {},
            sceneInfo: {},
            lastTime: '',
            result: {
                show: false,
                list: []
            }
        }
    },
    created() {
        // 必须
        sl.ready()
        // 登录
        this.login()
    },
    mounted() {
        Tools.loadImage('/static/images/game/niudan/egg_bg_cheap@2x.png').then(res => {
            setTimeout(() => {
                this.loading = false
            }, 888)
        })

        setTimeout(() => {
            // 加载结果页资源
            this.resource.forEach(item => {
                Tools.loadImage(item)
            })
        }, 1)
    },
    filters: {
        getTime(time) {
            return Tools.timeFormat(time)
        }
    },
    methods: {
        go2profile(member_id) {
            sl.menu({
                type: 'DYNSMIC',
                id: member_id + ''
            }, () => {
                console.log('DYNSMIC', member_id)
            })
        },
        login(loading = false) {
            sl.game.login({game_id: this.gameId}, res => {
                if(res.code === this.$constants.successCode) {
                    if(res.data.member_info) {// 会员信息
                        this.memberInfo = res.data.member_info
                    }else {
                        Tools.toast(this.$t('game.error.userinfo'), () => {
                            sl.menu({type: 'LOGIN'}, res => {
                                console.log('login', res)
                            })
                        })
                    }

                    if(res.data.scene_info) {
                        if(loading) {
                            setTimeout(() => {
                                //
                                for(let item of res.data.scene_info.ND_LUXURY.product_pool) {
                                    Tools.loadImage(item.pic_url)
                                }
                            }, 1)
                        }
                        this.sceneInfo = res.data.scene_info
                    }else {
                        Tools.toast(this.$t('game.error.configuration'))
                    }

                    if(res.data.game_rule) {// 游戏规则
                        this.rule.content = res.data.game_rule
                    }else {
                        Tools.toast(this.$t('game.error.rule'))
                    }
                }else {
                    Tools.toast(res.msg)
                }
            })
        },
        // 我的收获
        loadGainData(pageInfo) {
            return new Promise((resolve, reject) => {
                sl.game.record({
                    game_id: this.gameId,
                    type: 'SELF',
                    page: pageInfo.page,
                    page_size: pageInfo.pageSize
                }, res => {
                    if(res.code == this.$constants.successCode) {
                        if(res.data.length) {
                            resolve(res.data)
                        }else {
                            resolve([])
                        }
                    }else {
                        Tools.toast(res.msg)
                    }
                })
            })
        },
        // 全服记录
        loadRecordData(pageInfo) {
            return new Promise((resolve, reject) => {
                sl.game.record({
                    game_id: this.gameId,
                    type: 'ALL',
                    page: pageInfo.page,
                    page_size: pageInfo.pageSize
                }, res => {
                    if(res.code == this.$constants.successCode) {
                        if(res.data.length) {
                            resolve(res.data)
                        }else {
                            resolve([])
                        }
                    }else {
                        Tools.toast(res.msg)
                    }
                })
            })
        },
        setMode(mode) {
            if(!this.playing) {
                Tools.hideToast()
                this.mode = mode
                this.setPollMode(mode - 1)
            }
        },
        setPollMode(mode) {
            this.poll.mode = mode
        },
        again() {
            this.result.show = false
            this.play(this.lastTime)
        },
        play(times) {
            if(!this.playing) {
                Tools.hideToast()
                // 先获取当前钻石数量，判断是否足够
                sl.game.login({game_id: this.gameId}, res => {
                    if(res.code === this.$constants.successCode) {
                        if(res.data.member_info) {// 会员信息
                            this.memberInfo = res.data.member_info
                        }else {
                            Tools.toast(this.$t('game.error.userinfo'), () => {
                                sl.menu({type: 'LOGIN'}, res => {
                                    console.log('login', res)
                                })
                            })
                            return
                        }

                        if(res.data.scene_info) {
                            this.sceneInfo = res.data.scene_info
                        }else {
                            Tools.toast(this.$t('game.error.configuration'))
                        }

                        // 当前钻石数量
                        const curr = Number.parseFloat(this.memberInfo.balance.diamond)

                        // 本地所需钻石数量
                        let amount
                        if(this.mode === 1) {
                            amount = Number.parseFloat(this.sceneInfo.ND_COLOR.diamond * times)
                        }else {
                            amount = Number.parseFloat(this.sceneInfo.ND_LUXURY.diamond * times)
                        }

                        if(curr >= amount) {
                            this.playing = true
                            this.lastTime = times

                            if(this.playTimer) {
                                clearTimeout(this.playTimer)
                            }
                            try {
                                sl.game.start({
                                    game_id: this.gameId,
                                    game_scene: this.mode === 1 ? 'ND_COLOR' : 'ND_LUXURY',
                                    num: times
                                }, res => {
                                    if(this.playTimer) {
                                        clearTimeout(this.playTimer)
                                    }

                                    setTimeout(() => {
                                        if(res.code === this.$constants.successCode) {
                                            const ret = []
                                            for(const item of res.data.product_data.values()) {
                                                if(!ret[item.product_id]){
                                                    ret[item.product_id] = {
                                                        ...item,
                                                        amount: 1
                                                    }
                                                }else {
                                                    ret[item.product_id]['amount']++
                                                }
                                            }
                                            this.result.list = ret.filter(item => (item)).sort((a, b) => (b.amount - a.amount))
                                            this.result.show = true
                                        }else {
                                            Tools.toast(res.msg)
                                        }
                                        this.playing = false
                                    }, 1000)
                                })

                                this.playTimer = setTimeout(() => {
                                    if(this.playing === true) {
                                        this.playing = false
                                        Tools.toast(this.$t('game.error.unknow'))
                                    }
                                }, 5000)
                            }catch(err) {
                                console.error(`play-${times}-error-${error}`, error)
                                Tools.toast(err.message)
                            }
                        }else {
                            Tools.confirm({
                                content: `您的货币不足（现有${this.$t('diamond')}：${curr}），是否前往${this.$t('topup')}`,
                                confirmText: `去${this.$t('topup')}`,
                                onConfirm: () => {
                                    sl.menu({type: 'TOPUP'}, res => {
                                        console.log('topup', res)
                                    })
                                }
                            })
                        }
                    }else {
                        Tools.toast(res.msg)
                    }
                })
            }
        },
        basket() {
            if(!this.playing) {
                Tools.hideToast()
                this.result.show = false
                sl.menu({type: 'PACKET'}, res => {
                    console.log('basket', res)
                })
            }
        },
        rank() {
            if(!this.playing) {
                Tools.hideToast()
                sl.menu({type: 'RANKING'}, res => {
                    console.log('rank', res)
                })
            }
        },
        ruleDrawer() {
            if(!this.playing) {
                Tools.hideToast()
                this.rule.show = true
            }
        },
        pollDrawer() {
            if(!this.playing) {
                Tools.hideToast()
                this.poll.show = true
            }
        },
        gainDrawer() {
            if(!this.playing) {
                Tools.hideToast()
                this.gain.show = true
            }
        },
        recordDrawer() {
            if(!this.playing) {
                Tools.hideToast()
                this.record.show = true
            }
        },
        close() {
            if(!this.playing) {
                Tools.hideToast()
                sl.close({}, res => {
                    console.log('close', res)
                })
            }
        }
    }
}
</script>

<style lang="less" scoped>
@height: 950px;
@blue: #2276FF;
@url: '../../assets/images/game/niudan';

.bg(@postion:center, @size:cover) {
    background-color: rgba(0,0,0,0);
    background-repeat: no-repeat;
    background-position: @postion center;
    background-size: @size;
}
// 2x图
.bg-image(@name) {
    background-image: ~"url('@{url}/@{name}@2x.png')";
    // @media (-webkit-min-device-pixel-ratio: 2), (min-device-pixel-ratio: 2) {
    //     background-image: ~"url('@{url}/@{name}@2x.png')";
    // }
}
.ellipsis() {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

#niudan {
    width: 100%;
    height: 100%;
    position: relative;
    background: rgba(0, 0, 0, 0);
    .result {
        position: absolute;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, .8);
        overflow: hidden;
        padding-top: 120px;
        z-index: 3;
        .content {
            &::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                top: -255px;
                left: 0;
                .bg(top, contain);
                background-image: ~"url(/static/images/game/niudan/pop_title.png)";
            }
            overflow: visible;
            animation: zoomInDown .8s;
            width: 676px;
            height: auto;
            margin: 282px auto;
            background-color: #F7F2DC;
            background-size: 450px 94px;
            border-radius: 52px;
            border: 13px solid #FFE196;
            position: relative;
            ul {
                margin: 70px auto 40px;
                display: flex;
                flex-wrap: wrap;
                justify-content: flex-start;
                max-height: 220px * 2 + 20px * 2 + 20px;
                overflow: scroll;
                width: 192px * 3 + 20px * 2;
                li {
                    width: 190px;
                    height: 220px;
                    border-radius: 12px;
                    background-color: #FFFFFF;
                    margin: 0 20px 20px 0;
                    &:nth-child(3n) {
                        margin-right: 0;
                    }
                    &:nth-last-child(-n+3) {//最后3个
                        margin-bottom: 0;
                    }
                    .name {
                        display: block;
                        text-align: center;
                        line-height: 46px;
                        background-color: #FFE196;
                        font-size: 24px;
                        font-weight: 500;
                        color: #2C3546;
                        .ellipsis;
                        border-radius: 12px 12px 0 0;
                    }
                    img {
                        display: block;
                        width: 100px;
                        height: 100px;
                        margin: 16px auto;
                    }
                    p {
                        text-align: center;
                        font-size: 20px;
                        font-weight: 500;
                        color: #8994A7;
                        line-height: 20px;
                        font {
                            color: @blue;
                        }
                    }
                }
            }
            .btns {
                display: flex;
                justify-content: space-around;
                div {
                    display: block;
                    width: 292px;
                    height: 100px;
                    font-size: 30px;
                    font-weight: 500;
                    color: #A34100;
                    line-height: 80px;
                    background-image: ~"url(/static/images/game/niudan/pop_btn_bg@2x.png)";
                    .bg;
                    text-align: center;
                }
            }
            .p {
                text-align: center;
                font-size: 24px;
                font-weight: 500;
                color: #B67946;
                line-height: 34px;
                margin: 18px auto 28px;
                font {
                    color: @blue;
                    text-decoration: underline;
                }
            }
        }

    }
}

.niudan {
    width: 100%;
    height: @height;
    min-height: @height;
    max-height: @height;
    position: absolute;
    margin: auto;
    bottom: 0;
    overflow: visible;
    .bg(bottom);
    backface-visibility: hidden;
    transition: all .5s;
    &.mode1 {
        &.active {
            z-index: 2;
            transform: rotateY(0deg);
        }
        z-index: 1;
        transform: rotateY(-180deg);
        background-image: ~"url('/static/images/game/niudan/egg_bg_cheap@2x.png')";
    }
    &.mode2 {
        &.active {
            z-index: 2;
            transform: rotateY(0deg);
        }
        z-index: 1;
        transform: rotateY(180deg);
        .bg-image('mode2/egg_bg_expensive');
        .btn {
            box-shadow: inset 0 -4px 5px rgba(255, 255, 255, .1),
					    inset 0 1px 5px rgba(255, 255, 255, .1),
					    0 2px 0 #1D8CB5,
                        0 4px 0 #1D8CB5,
                        0 6px 0 #1D8CB5,
                        0 8px 5px rgba(0, 0, 0, .5);
            &:active {
                box-shadow: inset 0 4px 5px rgba(255, 255, 255, .1),
                            inset 0 -1px 5px rgba(255, 255, 255, .1),
                            0 2px 0 #1D8CB5,
                            0 4px 5px rgba(0, 0, 0, .5);
            }
        }
    }
    .diamond {
        min-width: 123px;
        height: 40px;
        line-height: 40px;
        background: #FFFFFF;
        border-radius: 20px;
        position: absolute;
        top: 85px;
        left: 23px;
        img {
            display: inline-block;
            width: 32px;
            height: 27px;
            vertical-align: middle;
            margin: 0 0 0 14px;
        }
        font {
            display: inline-block;
            vertical-align: middle;
            max-width: 125px;
            letter-spacing: 0;
            .ellipsis;
            font-size: 28px;
            font-family: "Alibaba-PuHuiTi-Bold", "Helvetica", "Arial", "sans-serif";
            font-weight: bold;
            color: #A34100;
            margin: 0 14px 0 0;
        }
    }
    .close {
        display: block;
        position: absolute;
        top: 86px;
        right: 20px;
        width: 30px;
        height: 30px;
        .bg-image('mode2/egg_btn_close');
        .bg;
    }
    .mode1 {
        display: block;
        position: absolute;
        top: 144px;
        left: 180px;
        width: 188px;
        height: 56px;
        .bg(center, contain);
        .bg-image('mode2/egg_btn_cheap_normal');
        &.active {
            .bg-image('mode1/egg_btn_cheap_current');
        }
    }
    .mode2 {
        display: block;
        position: absolute;
        top: 144px;
        right: 180px;
        width: 188px;
        height: 56px;
        .bg(center, contain);
        .bg-image('mode1/egg_btn_expensive_normal');
        &.active {
            .bg-image('mode2/egg_btn_expensive_current');
        }
    }
    .cover {
        position: absolute;
        width: 460px;
        height: 494px;
        top: 242px;
        left: 146px;
        span {
            position: absolute;
            width: 100px;
            height: 100px;
            .bg;
        }
        span:nth-child(11) {
            top: 215px;
            left: 99px;
            animation: animation-fall 1s linear .9s backwards;
            z-index: 1;
            &:after {
                animation-delay: .8s;
            }
            &.fly {
                animation: animation-fly1 1s linear infinite;
            }
        }
        span:nth-child(10) {
            top: 284px;
            left: 1px;
            animation: animation-fall 1s linear .6s backwards;
            z-index: 1;
            &:after {
                animation-delay: .5s;
            }
            &.fly {
                animation: animation-fly2 1s linear infinite;
            }
        }
        span:nth-child(9) {
            top: 295px;
            left: 46px;
            animation: animation-fall 1s linear .7s backwards;
            z-index: 1;
            &:after {
                animation-delay: .6s;
            }
            &.fly {
                animation: animation-fly3 1s linear infinite;
            }
        }
        span:nth-child(8) {
            top: 300px;
            left: 149px;
            animation: animation-fall 1s linear .3s backwards;
            z-index: 1;
            &:after {
                animation-delay: .2s;
            }
            &.fly {
                animation: animation-fly4 1s linear infinite;
            }
        }
        span:nth-child(7) {
            top: 280px;
            left: 245px;
            animation: animation-fall 1s linear .8s backwards;
            z-index: 1;
            &:after {
                animation-delay: .7s;
            }
            &.fly {
                animation: animation-fly5 1s linear infinite;
            }
        }
        span:nth-child(6) {
            top: 294px;
            right: 14px;
            animation: animation-fall 1s linear .4s backwards;
            z-index: 1;
            &:after {
                animation-delay: .3s;
            }
            &.fly {
                animation: animation-fly6 1s linear infinite;
            }
        }
        span:nth-child(5) {
            top: 385px;
            left: 1px;
            animation: animation-fall 1s linear .9s backwards;
            z-index: 1;
            &:after {
                animation-delay: .8s;
            }
            &.fly {
                animation: animation-fly7 1s linear infinite;
            }
        }
        span:nth-child(4) {
            top: 385px;
            left: 98px;
            animation: animation-fall 1s linear .6s backwards;
            z-index: 1;
            &:after {
                animation-delay: .5s;
            }
            &.fly {
                animation: animation-fly8 1s linear infinite;
            }
        }
        span:nth-child(3) {
            top: 385px;
            left: 195px;
            animation: animation-fall 1s linear .9s backwards;
            z-index: 1;
            &:after {
                animation-delay: .8s;
            }
            &.fly {
                animation: animation-fly9 1s linear infinite;
            }
        }
        span:nth-child(2) {
            top: 379px;
            left: 257px;
            animation: animation-fall 1s linear .2s backwards;
            z-index: 1;
            &:after {
                animation-delay: .1s;
            }
            &.fly {
                animation: animation-fly10 1s linear infinite;
            }
        }
        span:nth-child(1) {
            top: 393px;
            right: 4px;
            animation: animation-fall 1s linear .7s backwards;
            z-index: 1;
            &:after {
                animation-delay: .6s;
            }
            &.fly {
                animation: animation-fly11 1s linear infinite;
            }
        }
    }
    .rule {
        position: absolute;
        top: 296px;
        left: 18px;
        width: 92px;
        height: 92px;
        .bg;
        .bg-image('mode2/egg_btn_rules');
    }
    .record {
        position: absolute;
        top: 421px;
        left: 18px;
        width: 92px;
        height: 92px;
        .bg;
        .bg-image('mode2/egg_btn_record_all');
    }
    .gain {
        position: absolute;
        top: 546px;
        left: 18px;
        width: 92px;
        height: 92px;
        .bg;
        .bg-image('mode2/egg_btn_record_my');
    }
    // .rank {
    //     position: absolute;
    //     top: 296px;
    //     right: 19px;
    //     width: 92px;
    //     height: 92px;
    //     .bg;
    //     .bg-image('mode2/egg_btn_rank');
    // }
    .basket {
        position: absolute;
        //top: 421px;
        top: 296px;
        right: 19px;
        width: 92px;
        height: 92px;
        .bg;
        .bg-image('mode2/egg_btn_bag');
    }
    .poll {
        position: absolute;
        //top: 546px;
        top: 421px;
        right: 19px;
        width: 92px;
        height: 92px;
        .bg;
        .bg-image('mode2/egg_btn_gifts');
    }
    .btn {
        width: 230px;
        height: 88px;
        position: absolute;
        top: 798px;
        left: 114px;
        border-radius: 30px;
        box-shadow: inset 0 -4px 5px rgba(255, 255, 255, .1),
					inset 0 1px 5px rgba(255, 255, 255, .1),
					0 2px 0 #8E35D9,
					0 4px 0 #8E35D9,
					0 6px 0 #8E35D9,
					0 8px 5px rgba(0, 0, 0, .5);
        &:active {
            top: 802px;
            box-shadow: inset 0 4px 5px rgba(255, 255, 255, .1),
						inset 0 -1px 5px rgba(255, 255, 255, .1),
						0 2px 0 #8E35D9,
						0 4px 5px rgba(0, 0, 0, .5);
        }
        .bg;
        .bg-image('mode1/egg_btn_n');
        &.right {
            left: 406px;
        }
        span {
            position: absolute;
            top: 15px;
            display: block;
            width: 100%;
            text-align: center;
            line-height: 22px;
            font-size: 24px;
            font-family: "Alibaba-PuHuiTi-Bold", "Helvetica", "Arial", "sans-serif";
            font-weight: bold;
            color: #A34100;
            &:last-child {
                top: 45px;
                line-height: 18px;
                font-size: 24px;
            }
            img {
                display: inline-block;
                width: 22px;
                height: 18px;
                vertical-align: middle;
            }
            font {
                display: inline-block;
                vertical-align: middle;
            }
        }
    }
}

.poll-drawer {
    nav {
        margin: 20px 0 0 36px;
        height: 60px;
        span {
            display: inline-block;
            vertical-align: middle;
            font-size: 28px;
            font-weight: 600;
            color: #8994A7;
            line-height: 40px;
            margin-right: 36px;
            &.active {
                font-size: 36px;
                font-weight: bold;
                color: #2C3546;
                line-height: 50px;
                position: relative;
                &:after {
                    content: '';
                    display: block;
                    position: absolute;
                    bottom: -10px;
                    width: 24px;
                    height: 8px;
                    background-color: #FFAD00;
                    border-radius: 4px;
                    margin: auto;
                    left: 0;
                    right: 0;
                }
            }
        }
    }
    .swiper {
        /deep/ .vux-swiper {
            height: 622px!important;
            max-height: 622px;
        }
    }
    ul {
        margin: 20px 26px 0 52px;
        display: flex;
        flex-wrap: wrap;
        justify-content: flex-start;
        overflow-y: auto;
        max-height: 622px;
        padding-bottom: 52px;
        li {
            width: 200px;
            height: 252px;
            background: #FFFFFF;
            border-radius: 16px;
            margin-right: 24px;
            margin-bottom: 20px;
            .ellipsis;
            &:nth-child(3n) {
                margin-right: 0;
            }
            &:nth-last-child(-n+3) {//最后3个
                margin-bottom: 0;
            }
            img {
                display: block;
                margin: 20px auto;
                width: 128px;
                height: 128px;
            }
            h6 {
                font-size: 26px;
                font-weight: 500;
                color: #2C3546;
                line-height: 26px;
                margin-bottom: 12px;
                text-align: center;
            }
            p {
                font-size: 22px;
                font-weight: 500;
                color: #8994A7;
                line-height: 22px;
                text-align: center;
                font {
                    color: @blue;
                }
            }
        }
    }
}
.record-drawer {
    .item {
        padding: 24px 30px 24px 32px;
        display: flex;
        justify-content: space-between;
        .avatar {
            width: 72px;
            height: 72px;
            border-radius: 50%;
        }
        div {
            flex: 1;
            padding-left: 14px;
            h6 {
                font-weight: 500;
                display: flex;
                justify-content: space-between;
                font {
                    font-size: 28px;
                    color: #2C3546;
                    line-height: 28px;
                    vertical-align: middle;
                    display: inline-block;
                }
                span {
                    font-size: 20px;
                    color: #8994A7;
                    line-height: 20px;
                    vertical-align: middle;
                    display: inline-block;
                }
            }
            p {
                font-size: 24px;
                font-weight: 500;
                color: #8994A7;
                line-height: 24px;
                font {
                    color: @blue;
                }
                img {
                    width: 48px;
                    height: 48px;
                    display: inline-block;
                    vertical-align: middle;
                }
            }
        }
    }
}
.gain-drawer {
    .item {
        padding: 28px 34px 30px;
        p {
            font-size: 26px;
            font-weight: 500;
            color: #8994A7;
            line-height: 24px;
            font {
                color: @blue;
            }
            img {
                display: inline-block;
                vertical-align: middle;
                width: 48px;
                height: 48px;
                margin-left: 12px;
            }
        }
        span {
            font-size: 20px;
            font-weight: 500;
            color: #8994A7;
            line-height: 20px;
            margin-top: 18px;
            display: inline-block;
        }
    }
}
.rule-drawer {
    .content {
        width: 654px;
        max-height: 700px;
        margin: 35px auto;
        padding-bottom: 50px;
        text-align: justify;
        white-space: pre-wrap;
        overflow-y: auto;
        /deep/ * {
            max-width: 100%!important;
        }
    }
}

.drawer-list {
    height: 744px;
    overflow: hidden;
    .loadable-list {
        height: 100%;
    }
}


@keyframes animation-fly11 {
    20% {
        transform: translate(5px, -250px);
    }
    40% {
        transform: translate(-330px, -300px);
    }
    60% {
        transform: translate(5px, -150px);
    }
    80% {
        transform: translate(-350px, -50px);
    }
}
@keyframes animation-fly10 {
    20% {
        transform: translate(-250px, -120px);
    }
    45% {
        transform: translate(100px, -250px);
    }
    65% {
        transform: translate(-160px, -350px);
    }
    90% {
        transform: translate(100px, -50px);
    }
}
@keyframes animation-fly9 {
    30% {
        transform: translate(140px, -300px);
    }
    60% {
        transform: translate(-160px, -300px);
    }
}
@keyframes animation-fly8 {
    15% {
        transform: translate(260px, -100px);
    }
    40% {
        transform: translate(-100px, -200px);
    }
    65% {
        transform: translate(240px, -300px);
    }
    90% {
        transform: translate(-100px, -50px);
    }
}
@keyframes animation-fly7 {
    25% {
        transform: translate(30px, -300px);
    }
    40% {
        transform: translate(200px, -380px);
    }
    60% {
        transform: translate(360px, -200px);
    }
    90% {
        transform: translate(80px, 0);
    }
}
@keyframes animation-fly6 {
    25% {
        transform: translate(-120px, -300px);
    }
    45% {
        transform: translate(-350px, -80px);
    }
    65% {
        transform: translate(-180px, 100px);
    }
    85% {
        transform: translate(20px, 70px);
    }
}
@keyframes animation-fly5 {
    20% {
        transform: translate(-200px, -200px);
    }
    40% {
        transform: translate(50px, -230px);
    }
    60% {
        transform: translate(-250px, 0px);
    }
    75% {
        transform: translate(50px, 90px);
    }
    90% {
        transform: translate(100px, 50px);
    }
}
@keyframes animation-fly4 {
    15% {
        transform: translate(130px, 100px);
    }
    30% {
        transform: translate(210px, -10px);
    }
    60% {
        transform: translate(-50px, -280px);
    }
    80% {
        transform: translate(-150px, -100px);
    }
}
@keyframes animation-fly3 {
    10% {
        transform: translate(-50px, -50px);
    }
    25% {
        transform: translate(0, -250px);
    }
    45% {
        transform: translate(250px, -250px);
    }
    65% {
        transform: translate(310px, -80px);
    }
    90% {
        transform: translate(100px, 100px);
    }
}
@keyframes animation-fly2 {
    10% {
        transform: translate(20px, 110px);
    }
    20% {
        transform: translate(360px, -50px);
    }
    40% {
        transform: translate(250px, -250px);
    }
    60% {
        transform: translate(80px, -250px);
    }
    80% {
        transform: translate(360px, -100px);
    }
}
@keyframes animation-fly1 {
    15% {
        transform: translate(-50px, -170px);
    }
    35% {
        transform: translate(200px, -170px);
    }
    50% {
        transform: translate(-100px, -50px);
    }
    65% {
        transform: translate(260px, 50px);
    }
    85% {
        transform: translate(-110px, 100px);
    }
    95% {
        transform: translate(100px, 150px);
    }
}

@keyframes animation-fall {
    0% {
        transform: translateY(-200%);
        opacity:0
    }
    5% {
        transform: translateY(-200%);
    }
    15% {
        transform: translateY(0);
    }
    30% {
        transform: translateY(-100%);
    }
    40% {
        transform: translateY(0%);
    }
    50% {
        transform: translateY(-60%);
    }
    70% {
        transform: translateY(0%);
    }
    80% {
        transform: translateY(-30%);
    }
    90% {
        transform: translateY(0%);
    }
    95% {
        transform: translateY(-14%);
    }
    97% {
        transform: translateY(0%);
    }
    99% {
        transform: translateY(-6%);
    }
    100% {
        transform: translateY(0);
        opacity: 1;
    }
}
</style>
