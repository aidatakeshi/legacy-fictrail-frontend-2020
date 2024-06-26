<script>

/**
 * List Item (Generic Use)
 */

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const config = require('~/config.list-item.js');
const env = require('~/config.js');

import ColorBox from '@/components/color-box';

import {
    BIcon, BIconPen, BIconX, BIconCheck, BIconLayers, BIconGraphDown, BIconTrash, BIconTable,
} from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX, BIconCheck, BIconLayers, BIconGraphDown, BIconTrash, BIconTable,
        ColorBox,
    },
    props: {
        type: null,
        nullable: Boolean,
        limit: null,
        query: Object,
        query2: Object,
        data: Array, //Input data. If null, then API is called inside
        trigger: null,
    },
    data() {
        return {
            data$: [],
            count: null,
            page: null,
            limit_b: null,
            configOfList: {},
        };
    },
    watch: {
        trigger(){
            this.page = 1;
            this.reload();
        },
    },
    mounted(){
        this.page = 1;
        this.reload();
    },
    methods:{
        displayTime: $.displayTime,
        displaySignedNumber: $.displaySignedNumber,

        //Reload
        async reload(){
            //Get Config of Type
            if (!config.data[this.type]) return false;
            this.configOfList = config.data[this.type].list;
            //If not external data, call API to get data
            if (this.data === null || this.data === undefined){
                //Prepare Query
                var query = Object.assign((this.query||{}), (this.query2||{}));
                query.page = this.page;
                query.limit = this.limit;
                //Call API
                var response = await $.callAPI(axios, 'GET', 'items/'+this.type, query);
                if (response.http_status >= 400) return false;
                this.data$ = response.data;
                this.page = response.page;
                this.limit_b = response.limit;
                this.count = response.count;
            }
            //Otherwise, use prop data
            else{
                this.data$ = this.data;
            }
        },

        //Remove Item
        async removeItem(id){
            var c = confirm(`確認移除? (ID = ${id})`);
            if (!c) return false;
            var route = 'items/'+this.type+'/'+encodeURIComponent(id);
            var response = await $.callAPI(axios, 'DELETE', route, {});
            if (response.http_status >= 400) return false;
            this.$emit('removed', id);
            this.$emit('change', id);
        },

        //Pagination
        pageClicked(event, page){
            this.page = page;
            this.reload();
        },
        jumpToPage(){
            var page = parseInt(prompt("請輸入頁數："));
            if (isNaN(page) || page == null) return false;
            if (page < 1) page = 1;
            var pages = Math.ceil(this.count / this.limit);
            if (page > pages) page = pages;
            this.page = page;
            this.reload();
        },

        //Number Display
        decimals(number, decimals){
            var num = number * 1;
            if (isNaN(num)) return number;
            if (decimals === null) return number;
            return num.toFixed(decimals);
        },

        //Image URL
        image_url(key){
            return `${env.API_BASE_URL}/file/${key}`;
        },
        //Image Style
        image_style(listConfig){
            var obj = {};
            if (listConfig.width) obj['max-width'] = listConfig.width;
            if (listConfig.height) obj['max-height'] = listConfig.height;
            return obj;
        }
    },
}
</script>

<template>
    <div>
        <div class="table-responsive">

            <!-- Pagination -->
            <div v-if="limit_b" class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="my-2" @click="jumpToPage()"><strong>共有{{count}}項結果：</strong></div>
                <b-pagination v-model="page" :total-rows="count" :per-page="limit_b" v-if="count > limit_b"
                    first-number last-number
                    @page-click="pageClicked"
                ></b-pagination>
            </div>

            <!-- The Table -->
            <table class="table table-hover my-table" v-if="configOfList">
                <!-- Header ------------------------------------------------------------>
                <thead>
                    <tr class="thead-light">
                        <th class="col-button"></th>
                        <th v-for="(listConfig, i) in configOfList" :key="i">{{listConfig.label}}</th>
                        <th class="col-button"></th>
                    </tr>
                </thead>
                <!-- Body -------------------------------------------------------------->
                <tbody>
                    <tr v-for="(item, j) in data$" :key="j">
                        <!-- Edit Button -->
                        <td class="buttons">
                            <b-button variant="outline-info" @click="$emit('edit', item.id)">
                                <b-icon-pen />
                            </b-button>
                        </td>
                        <!----------------------->
                        <template v-for="(listConfig, i) in configOfList">
                            <!-- "remarks" -->
                            <td :key="i" v-if="listConfig.format == 'remarks'" class="remarks"><!---
                            --->{{item[listConfig.field]}}<!---
                        ---></td>
                            <!-- "name" -->
                            <td :key="i" v-else-if="listConfig.format == 'name'" class="name">
                                {{item[listConfig.field]}}
                                <small v-if="item[listConfig.field_bracket]">
                                    ({{item[listConfig.field_bracket]}})
                                </small>
                                <template v-if="listConfig.field_sub">
                                    <br/>
                                    <small v-if="listConfig.field_sub">
                                        {{item[listConfig.field_sub]}}
                                    </small>
                                    <small v-if="item[listConfig.field_sub_bracket]">
                                        ({{item[listConfig.field_sub_bracket]}})
                                    </small>
                                </template>
                            </td>
                            <!-- "link" -->
                            <td :key="i" v-else-if="listConfig.format == 'link'" class="name">
                                <nuxt-link :to="listConfig.url + item.id">
                                    {{item[listConfig.field]}}
                                </nuxt-link>
                            </td>
                            <!-- "id" -->
                            <td :key="i" v-else-if="listConfig.format == 'id'">
                                <b-badge>{{item[listConfig.field]}}</b-badge>
                            </td>
                            <!-- "color" -->
                            <td :key="i" v-else-if="listConfig.format == 'color'" class="color">
                                <color-box :color="item[listConfig.field]"></color-box>
                            </td>
                            <!-- "image" -->
                            <td :key="i" v-else-if="listConfig.format == 'image'">
                                <img v-if="item[listConfig.field]"
                                :src="image_url(item[listConfig.field])"
                                :style="image_style(listConfig)" />
                            </td>
                            <!-- "boolean" -->
                            <td :key="i" v-else-if="listConfig.format == 'boolean'">
                                <span class="text-success" v-if="item[listConfig.field]">
                                    <b-icon-check v-if="!listConfig.text_true" scale="1.5" />
                                    <strong v-else>{{listConfig.text_true}}</strong>
                                </span>
                                <span class="text-danger" v-else>
                                    <b-icon-x v-if="!listConfig.text_false" scale="1.5" />
                                    <strong v-else>{{listConfig.text_false}}</strong>
                                </span>
                            </td>
                            <!-- "number" -->
                            <td :key="i" v-else-if="listConfig.format == 'number'">
                                <template v-if="item[listConfig.field]">
                                    {{decimals(item[listConfig.field], listConfig.decimals)}}
                                    <small v-if="listConfig.unit">{{listConfig.unit}}</small>
                                </template>
                                <template v-else>-</template>
                            </td>
                            <!-- "sort" -->
                            <td :key="i" v-else-if="listConfig.format == 'sort'">
                                <b-badge v-if="item[listConfig.field]" variant="warning">
                                    {{item[listConfig.field]}}
                                </b-badge>
                            </td>
                            <!-- "button_graph" -->
                            <td :key="i" v-else-if="listConfig.format == 'button_graph'">
                                <b-button variant="outline-info" class="px-2 py-1"
                                @click="$emit('view-graph', item.id)">
                                    <b-icon-graph-down />
                                </b-button>
                            </td>
                            <!-- "button_table" -->
                            <td :key="i" v-else-if="listConfig.format == 'button_table'">
                                <b-button variant="outline-info" class="px-2 py-1"
                                @click="$emit('view-table', item.id)">
                                    <b-icon-table />
                                </b-button>
                            </td>
                            <!-- "button_duplicate" -->
                            <td :key="i" v-else-if="listConfig.format == 'button_duplicate'">
                                <b-button variant="outline-info" class="px-2 py-1"
                                @click="$emit('duplicate', item.id)">
                                    <b-icon-layers />
                                </b-button>
                            </td>
                            <!-- "s_line_station_count" -->
                            <td :key="i" v-else-if="listConfig.format == 's_line_station_count'">
                                <b-button variant="outline-secondary" class="px-2 py-1" style="min-width: 2em;"
                                @click="$emit('view-line', item.id)" v-if="item.station_count">
                                    {{item.station_count}}
                                </b-button>
                                <span v-else>-</span>
                            </td>
                            <!-- "s_schdraft_pivot_time" -->
                            <td :key="i" v-else-if="listConfig.format == 's_schdraft_pivot_time'">
                                {{displayTime(item.pivot_time, true)}}<!---
                            ---><small class="text-secondary">{{displaySignedNumber(item.pivot_time_adj)}}</small>
                            </td>
                            <!-- "s_schdraft_train_type_name" -->
                            <td :key="i" v-else-if="listConfig.format == 's_schdraft_train_type_name'">
                                <template v-if="item.train_name_id">
                                    <b-badge>{{item.train_type_name_chi_short}}</b-badge>
                                    <color-box :color="item.train_name_color" />
                                    <strong>{{item.train_name_name_chi}}</strong>
                                </template>
                                <template v-else>
                                    <color-box :color="item.train_type_color" />
                                    <strong>{{item.train_type_name_chi}}</strong>
                                </template>
                            </td>
                            <!-- "s_schdraft_operator" -->
                            <td :key="i" v-else-if="listConfig.format == 's_schdraft_operator'">
                                <color-box :color="item.operator_color" />
                                <strong>{{item.operator_name_chi}}</strong>
                            </td>
                            <!-- Default -->
                            <td :key="i" v-else>
                                {{item[listConfig.field]}}
                            </td>
                            <!----------------------->
                        </template>
                        <!-- Delete Button -->
                        <td class="buttons">
                            <b-button variant="outline-danger">
                                <b-icon-trash @click="removeItem(item.id)" />
                            </b-button>
                        </td>
                        <!----------------------->
                    </tr>
                </tbody>
                <!---------------------------------------------------------------------->
            </table>

            <!-- Another Pagination -->
            <div v-if="limit_b" class="d-flex justify-content-between align-items-center flex-wrap">
                <div class="my-2"></div>
                <b-pagination v-model="page" :total-rows="count" :per-page="limit_b" v-if="count > limit_b"
                    first-number last-number
                    @page-click="pageClicked"
                ></b-pagination>
            </div>

        </div>
    </div>
</template>