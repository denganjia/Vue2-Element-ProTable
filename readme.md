# ProTable 组件

## 立即使用
复制文件到本地，直接导入使用

## `Props`属性

| 名称       | 描述                                                     | 类型    |
| ---------- | -------------------------------------------------------- | ------- |
| requestUrl | 定义在`api`文件夹下`modules`文件夹下的数据请求函数名称 | `String`  |
| data       | 数据源，如果`requestUrl`存在，那么此参数无效           | `Array`   |
| searchForm | 是否显示搜索表单，默认为`true`                             | `Boolean` |
| pagination | 分页器控件显示设置，默认为`{layout:"total, sizes, prev, pager, next, jumper"}` | `{layout:String}` |
| columns | 表格列配置 | 参考下方 `ColumnType` |
| labelWidth | 搜索表单的label宽度，默认为`105px`，可设置`auto`| `String` |

## `ColumnType`属性

| 名称 | 描述 | 类型 |
| ---- | ---- | ---- |
| type | 此列渲染成*选择列*还是*序号列*，非必填 | `'select' | 'index'` |
| label | 列名称，**必填** | `String` |
| width | 列宽度，非必填，默认为`auto` | `String` |
| dataIndex | 获取数据的Key，渲染为`el-tabel-column`的`prop`属性，**必填** | `String`|
| search | 是否显示在搜索表单中，默认为`true`，非必填 | `Boolean` |
| dataType | 渲染成哪种表单控件，`search`为`true`时必填 | `'text' | 'select' | 'datetimerange' | 'date' | 'time' | 'daterange' | 'timerange'` |
| value | `dataType`为`select`时必填，作为`select`的选择项，支持传入函数 | `[{label:string,value:number|string}] | ()=>[{label:string,value:number|string}]` |
| format| 列数据的格式化方式，非必填，默认使用`value?value:'-'` | `(row,column,callValue,index)=>string` |
| ellipsis | 是否设置超长显示省略号并增加tooltip，无默认值，非必填 | `Boolean` |
| showInTable | 此列是否显示在表格中，默认为true，非必填 | `Boolean` |
| clearable | 表单项是否支持一键清空，无默认值，非必填 | `Boolean`|
| initValue | 表单项默认值,非必填 | `String` |

## `slot`插槽
ProTable有三固定插槽：1.表格头部操作区域插槽，可用于批量删除或新增等操作。2.表格操作列插槽，可用于查看详情，删除当前数据等操作。3.分页插槽，可用于自定义分页器。
包含N个动态插槽，此动态插槽是根据```column```配置中```dataIndex```生成的，插槽名称就是`dataIndex`的值，用来处理需要将数据渲染成其他东西的情况

## 使用示例

```vue
<template>
  <div class="main-box">
    <pro-table ref="proTable" :columns="columns" request-url="noticeList">
      <!-- 表格头部操作区插槽-->
      <template v-slot:header>
        <el-button>新增公告</el-button>
      </template>
      <!-- 自定义动态插槽-->
      <template v-slot:avatar>
        <el-table-column label="头像" prop="avatar">
          <template v-slot="scope">
            <el-avatar :src="scope.row.avatar"></el-avatar>
          </template>
        </el-table-column>
      </template>
      <!-- 表格列操作区插槽-->
      <template v-slot:operation>
        <el-table-column label="操作" width="220px">
          <template v-slot="scope">
            <el-button>查看</el-button>
            <el-button>编辑</el-button>
            <el-button>删除</el-button>
          </template>
        </el-table-column>
      </template>
    </pro-table>
  </div>
</template>
<script>
import ProTable from "@/components/ProTable";
import EnumService from "@/utils/EnumService";

const noticeTypeFormat = (row, col, current) => {
  let res = "";
  EnumService.noticeType.forEach(item => {
    if (item.value === current) res = item.label;
  });
  return res;
};
export default {
  name: "noticeList",
  components: { ProTable, RichEditor },
  data() {
    return {
      // 表格列表
      columns: [
        { dataIndex: "title", dataType: "text", name: "公告标题", width: 300 },
        {
          dataIndex: "spotType",
          dataType: "select",
          name: "公告类型",
          value: this.ENUM.noticeType,
          format: noticeTypeFormat
        },
        { dataIndex: "spotId", dataType: "select", name: "关联景区", value: this.getAllScenic, showInTable: false },
      ],
    };
  },
  methods:{
      // 获取所有景区
    async getAllScenic() {
      const res = await this.$api["getSpotComboBox"]({});
      if (res.code === 200) {
        res.data.map(item => {
          item.value = item.code;
          item.label = item.name;
        });
        return res.data;
      }
      return [];
    }
  }
};
</script>

```