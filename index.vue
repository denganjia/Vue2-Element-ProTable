<template>
  <div class="main-box">
    <!-- 查询表单 start -->
    <div v-if="searchForm" class="table-search">
      <el-form ref="form" :inline="true" :label-position="'right'" :model="searchParam" :size="tableButtonSize"
        :label-width="labelWidth">
        <transition-group name="el-fade-in-linear">
          <el-form-item :label="fields.name + ' ：'" v-for="fields in getSearchField" :key="fields.dataIndex"
            :label-width="fields.labelWidth ? fields.labelWidth : labelWidth">
            <search-from-item :option="fields.value ? fields.value : []" :size="tableButtonSize"
              :target="fields.dataType" :index="fields.dataIndex" v-model="searchParam[fields.dataIndex]"
              :clearable="fields.clearable" :max-date="fields.maxDate"></search-from-item>
          </el-form-item>
        </transition-group>
      </el-form>
      <div class="search-operation">
        <el-button :size="tableButtonSize" icon="el-icon-search" type="primary" @click="search">搜索</el-button>
        <el-button :size="tableButtonSize" icon="el-icon-delete" @click="reset">重置</el-button>
        <el-button v-if="getRenderList > 4" :size="tableButtonSize" class="search-isOpen" type="text"
          @click="searchShow = !searchShow">
          {{ searchShow ? "合并" : "展开" }}
          <i :class="searchShow ? 'el-icon-arrow-up' : 'el-icon-arrow-down'"></i>
        </el-button>
      </div>
    </div>
    <!-- 查询表单 end -->

    <!--    表格主体start-->
    <!--    表格头部start-->
    <div class="table-header">
      <div class="table-header-lf">
        <slot name="header"></slot>
      </div>
      <div class="table-header-ri">
        <el-tooltip class="item" content="刷新" effect="dark" placement="top">
          <el-button :size="tableButtonSize" circle icon="el-icon-refresh" @click="getTableList"></el-button>
        </el-tooltip>
      </div>
    </div>
    <!--    表格头部end-->
    <el-table :data="requestUrl ? tableData : data" border element-loading-text="拼命加载中" height="575"
      tooltip-effect="dark" @selection-change="handleSelectionChange">
      <template v-for="field in getTableColumns">
        <slot :name="field.dataIndex">
          <el-table-column v-if="!field.type" :label="field.name" :prop="field.dataIndex"
            :width="field.width ? field.width : 'auto'" :formatter="field.format ? field.format : defaultFormat"
            :show-overflow-tooltip="field.ellipsis"></el-table-column>
          <el-table-column v-if="field.type === 'selection'" :width="field.width ? field.width : 'auto'"
            type="selection"></el-table-column>
          <el-table-column v-if="field.type === 'index'" :label="field.name" :width="field.width ? field.width : 'auto'"
            :index="field.render ? field.render : ''" type="index"></el-table-column>
        </slot>
      </template>
      <slot name="operation"></slot>
      <template slot="empty">
        <div class="table-empty">
          <img alt="notData" src="@/assets/images/notData.png" />
          <div>暂无数据</div>
        </div>
      </template>
    </el-table>
    <!-- 表格主体end-->
    <!-- 分页start-->
    <slot name="pagination">
      <el-pagination background @size-change="handleSizeChange" @current-change="handleCurrentChange"
        :current-page="pageable.pageNum" :page-sizes="[10, 20, 50, 100]" :page-size="pageable.pageSize"
        :layout="pagination.layout" :total="pageable.total"></el-pagination>
    </slot>
  </div>
</template>

<script>
import SearchFromItem from "./components/SearchFormItem";
import tablePage from "../mixins/tablePage";
import tableSelect from "../mixins/tableSelect";

export default {
  name: "index",
  components: { SearchFromItem },
  mixins: [tablePage, tableSelect],
  props: {
    columns: Array,
    // 数据
    data: Array,
    // 数据请求URL
    requestUrl: String,
    // 搜索表单
    searchForm: {
      type: Boolean,
      default: true
    },
    // 分页layout
    pagination: {
      type: Object,
      default: () => {
        return {
          layout: "total, sizes, prev, pager, next, jumper"
        };
      }
    },
    // label标签宽度
    labelWidth: {
      type: String,
      default: () => {
        return "105px";
      }
    }
  },
  computed: {
    //当前查询表单渲染的字段
    getSearchField () {
      let fields = this.columns.filter(item => {
        return item.search !== false && !item.type;
      });
      if (this.searchShow) {
        return fields;
      } else {
        return fields.slice(0, 4);
      }
    },
    // 总共需要渲染的字段
    getRenderList () {
      return this.columns.filter(item => {
        return item.search !== false && !item.type;
      }).length;
    },
    // 表格列表
    getTableColumns () {
      return this.columns.filter(item => {
        return item.showInTable !== false;
      });
    }
  },
  data () {
    return {};
  },
  created () {
    this.setInitValue();
    this.tableApiUrl = this.requestUrl;
    this.getTableList(this.searchParam);
  },
  methods: {
    handleSelectionChange (rowArr) {
      rowArr.length === 0 ? (this.isSelected = true) : (this.isSelected = false);
      this.selectedList = rowArr;
      this.$emit("selectionChange", rowArr);
    },
    defaultFormat (row, column, callValue) {
      return callValue ? callValue : "-";
    },
    setInitValue () {
      this.columns.forEach(item => {
        if (item.initValue) {
          this.$set(this.searchParam, item.dataIndex, item.initValue);
          this.$set(this.initSearchForm, item.dataIndex, item.initValue);
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
</style>