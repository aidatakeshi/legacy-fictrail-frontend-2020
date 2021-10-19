<script>

/**
 * Edit Item (Generic Use)
 */

import axios from '~/plugins/axios'
const $ = require('~/common.js');
const config = require('~/config.edit-item.js');
const env = require('~/config.js');

import { BIcon, BIconPen, BIconX } from 'bootstrap-vue'

export default {
    components:{
        BIcon, BIconPen, BIconX,
    },
    props: {
        type: null,
        nullable: Boolean,
    },
    data() {
        return {
            data$: {},
            isNew: false,
            editorConfig: [],
            dataDefault: {},
            editing_failed: false,
            trigger: 0,
        };
    },
    watch: {

    },
    mounted(){
        if (config.data[this.type]){
            this.editorConfig = config.data[this.type].editor;
            this.dataDefault = config.data[this.type].default || {};
        }
    },
    methods:{
        //Show Modal
        async showNew(data){
            //Clear data$
            for (var i in this.editorConfig){
                var field = this.editorConfig[i].field;
                this.data$[field] = this.dataDefault[field];
            }
            //Load Data
            data = data || {};
            for (var i in data){
                this.data$[i] = data[i];
            }
            //Open Modal
            this.isNew = true;
            this.editing_failed = false;
            this.$refs._modal.show();
            this.$forceUpdate();
        },
        async showEdit(id){
            //Load Data
            var route = 'items/'+this.type+'/'+encodeURIComponent(id);
            var response = await $.callAPI(axios, 'GET', route, {});
            if (response.http_response >= 400) return false;
            this.data$ = response.data;
            //Open Modal
            this.isNew = false;
            this.editing_failed = false;
            this.$refs._modal.show();
            this.$forceUpdate();
        },

        //Submit
        async submit(){
            //Submit New
            if (this.isNew){
                var url = "items/"+this.type;
                var response = await $.callAPI(axios, "POST", url, this.data$);
            }
            //Submit Edit
            else{
                var url = "items/"+this.type+"/"+encodeURI(this.data$.id);
                var response = await $.callAPI(axios, "PATCH", url, this.data$);
            }
            //Failed
            if (response.http_status >= 400){
                this.editing_failed = true;
            }
            //Success
            else{
                this.$emit(this.isNew ? 'created' : 'edited', this.data$.id);
                this.$emit('change', this.data$.id);
                this.$refs._modal.hide();
            }
        },
    },
}
</script>

<template>
    <div>
        <b-modal ref="_modal" centered scrollable hide-footer
        :title="isNew ? '新增項目' : '編輯項目'">

            <div class="row" v-for="(editorField, i) in editorConfig" :key="i">
                <!-- Label -->
                <div class="col-sm-4">
                    <strong>{{editorField.label}}</strong>
                </div>
                <!-- format: id -->
                <template v-if="editorField.format == 'id'">
                    <div class="col-sm-8">
                        <b-form-input type="text" v-model="data$[editorField.field]" size="sm"
                        @focus="editing_failed = false" :disabled="!isNew" />
                    </div>
                </template>
                <!-- format: remarks -->
                <div class="col-sm-12" v-else-if="editorField.format == 'remarks'">
                    <b-form-textarea v-model="data$[editorField.field]" size="sm" rows="5"
                    @focus="editing_failed = false" />
                </div>
                <!-- format: number -->
                <div class="col-sm-8" v-else-if="editorField.format == 'number'">
                    <b-form-input type="number" v-model="data$[editorField.field]" size="sm"
                    @focus="editing_failed = false" />
                </div>
                <!-- format: boolean -->
                <div class="col-sm-8" v-else-if="editorField.format == 'boolean'">
                    <b-checkbox switch v-model="data$[editorField.field]" class="my-1"
                    @focus="editing_failed = false" />
                </div>
                <!-- format: select -->
                <div class="col-sm-8" v-else-if="editorField.format == 'select'">
                    <select-item v-model="data$[editorField.field]" :type="editorField.select_type" size="sm"
                    :nullable="editorField.nullable" @focus="editing_failed = false" />
                </div>
                <!-- format: image -->
                <div class="col-sm-8" v-else-if="editorField.format == 'image'">
                    <select-image v-model="data$[editorField.field]"
                    :width="editorField.width" :height="editorField.height"
                    @focus="editing_failed = false" />
                </div>
                <!-- format: color -->
                <div class="col-sm-8 d-flex" v-else-if="editorField.format == 'color'">
                    <b-form-input type="color" v-model="data$[editorField.field]" size="sm"
                    @focus="editing_failed = false" @input="$forceUpdate()" />
                    <b-form-input type="text" v-model="data$[editorField.field]" size="sm"
                    @focus="editing_failed = false" @input="$forceUpdate()" />
                </div>
                <!-- default format -->
                <div class="col-sm-8" v-else>
                    <b-form-input type="text" v-model="data$[editorField.field]" size="sm"
                    @focus="editing_failed = false" />
                </div>
                <!---------------------------------------->
            </div>

            <!-- Failure -->
            <div class="text-center">
                <div class="text-danger" v-if="editing_failed">提交失敗</div>
            </div>

            <!-- Submit Button -->
            <div class="d-flex">
                <b-button variant="outline-secondary" block class="mt-2" @click="$refs._modal.hide()">
                    取消
                </b-button>
                <b-button variant="primary" block class="mt-2" @click="submit">
                    提交
                </b-button>
            </div>

        </b-modal>
    </div>
</template>