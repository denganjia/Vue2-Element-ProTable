/* 表格选择状态 */
let tableSelect = {
  data() {
    return {
      // 是否选中数据
      isSelected: true,
      // 选中的数据列表
      selectedList: []
    };
  },
  computed: {
    // 获取所选id
    selectedListIds: function () {
      let ids = [];
      this.selectedList.forEach(item => {
        ids.push(item["id"]);
      });
      return ids;
    }
  },
  methods: {
    // 选择操作
    handleSelectionChange(rowArr) {
      rowArr.length === 0 ? (this.isSelected = true) : (this.isSelected = false);
      this.selectedList = rowArr;
    }
  }
};
export default tableSelect;
