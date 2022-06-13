/* 表格页面的所有操作方法 */
// import { emptyObjVal } from "@/utils/util";

let tablePage = {
  data() {
    return {
      // 是否查看
      isView: false,
      // 表格数据
      tableData: [],
      // 是否有分页
      isPageable: true,
      // 是否展开更多搜索
      searchShow: false,
      // 表格页面组件大小
      tableButtonSize: "small",
      // 获取表格数据 ApiUrl
      tableApiUrl: "",
      // 分页数据
      pageable: {
        // 当前页数，为实际显示页数
        pageNum: 1,
        // 每页显示条数
        pageSize: 10,
        // 总条数
        total: 0
        // 排序方式（以什么排序，升序还是降序）
        // sort: "id,desc"
      },
      // 总参数(查询加分页)
      totalParam: {},
      // 查询参数(只包括查询)
      searchParam: {},
      // 是否点击了搜索，解决未点击搜索情况下输入筛选条件然后点击下一页实际筛选了
      hasSearched: true,
      // 初始值
      initSearchForm: {}
    };
  },
  mounted() {},
  computed: {
    // 分页所携参数，其他暂时默认，每页条数（默认为10），排序方式（默认为id）可配置
    // 修改默认排序方式示例 this.pageParam = { sort: 'id,desc' }
    pageParam: {
      get: function () {
        return {
          pageNum: this.pageable.pageNum,
          pageSize: this.pageable.pageSize
          // sort: this.pageable.sort
        };
      },
      set: function (newVal) {
        this.pageable.pageNum = newVal.pageNum ? newVal.pageNum : this.pageable.pageNum;
        this.pageable.pageSize = newVal.pageSize ? newVal.pageSize : this.pageable.pageSize;
        // this.pageable.sort = newVal.sort ? newVal.sort : this.pageable.sort;
      }
    }
  },
  methods: {
    /**
     * 获取表格数据
     * @param params 为获取表格数据参数(不必要)
     */
    async getTableList(params) {
      // 先更新查询参数
      this.updatedTotalParam();
      // 删除时间范围（必要）
      delete this.totalParam.dateRange;
      // 合并初始化需要的参数
      Object.assign(this.totalParam, params);
      try {
        const res = await this.$api[this.tableApiUrl](this.totalParam);
        if (this.tableApiUrl === "getInfoAuditList") {
          res.data.datalist.map(item => {
            if (item.originData) {
              item.originData = JSON.parse(item.originData);
              item.targetData = JSON.parse(item.targetData);
            }
            return item;
          });
        }
        this.tableData = this.isPageable ? res.data.datalist : res.data;
        // 解构后台返回的分页数据
        const { pageNum, pageSize, total } = res.data;
        this.isPageable && this.updatePageable({ pageNum, pageSize, total });
      } catch (error) {
        // console.log(error);
      }
    },
    /* 更新分页信息 */
    updatePageable(resPageable) {
      Object.assign(this.pageable, resPageable);
    },
    /* 更新查询参数 */
    updatedTotalParam() {
      this.totalParam = {};
      // 如果没有点击过搜索，那么就不带查询参数
      if (!this.hasSearched) return Object.assign(this.totalParam, this.pageParam);
      let nowSearchParam = {};
      for (let key in this.searchParam) {
        // this.searchParam[key] === false:某些状态判断值会为false
        if (
          Object.prototype.hasOwnProperty.call(this.searchParam, key) &&
          (this.searchParam[key] || this.searchParam[key] === false || this.searchParam[key] === 0)
        ) {
          nowSearchParam[key] = this.searchParam[key];
        }
      }
      console.log(nowSearchParam);
      Object.assign(this.totalParam, this.pageParam, nowSearchParam);
    },
    /* 表格数据查询 */
    search() {
      this.pageable.pageNum = 1;
      this.hasSearched = true;
      this.getTableList();
    },
    /* 表格数据重置 */
    reset() {
      this.pageable.pageNum = 1;
      this.totalParam = this.pageParam;
      this.hasSearched = false;
      this.searchParam = {};
      Object.keys(this.initSearchForm).forEach(key => {
        this.$set(this.searchParam, key, this.initSearchForm[key]);
      });
      this.getTableList(this.searchParam);
    },
    /* 每页条数改变 */
    handleSizeChange(val) {
      // 防止调用两次
      this.pageable.pageNum = 1;
      this.pageable.pageSize = val;
      this.getTableList();
    },
    /* 当前页改变 */
    handleCurrentChange(val) {
      this.pageable.pageNum = val;
      this.getTableList();
    },
    /**
     * 操作单条数据信息
     * @param {string} apiUrl 操作数据接口的apiUrl(必要)
     * @param {object} prams 携带的参数 {id,params}
     * @param {string} message 提示信息
     * @param {string} confirmType icon类型(不必要)
     * @param {string} isOperation 是否后续调用接口(不必要)
     * @return void
     */
    handleData(apiUrl, params, message, confirmType = "warning", isOperation = false) {
      // let msg = !isHtml ? `是否${message}?` : message;
      this.$confirm(`是否${message}?`, "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: confirmType
      })
        .then(async () => {
          try {
            /* 景区列表处的删除逻辑 */
            if (isOperation && params.deleted) {
              const { data } = await this.$api.checkSpotHasTime(params);
              if (data)
                return this.$message({
                  type: "warning",
                  message: `当前景区仍有预约时段,无法删除,请先前往景区库存设置删除预约时段后再试!`
                });
            }
            const res = await this.$api[apiUrl](params);
            console.log(res);
            if (isOperation) {
              this.$message({
                type: "success",
                message: `${res.data ? "删除" : "恢复"}成功!`
              });
            } else {
              this.$message({
                type: "success",
                message: `${message}成功!`
              });
            }

            // 当删除数据的时候最后一页只有一条数据就让pageNum -1
            if ((this.pageable.total - 1) % this.pageable.pageSize === 0 && this.pageable.pageNum !== 1) {
              this.pageable.pageNum = this.pageable.pageNum - 1;
            }
            await this.getTableList();
          } catch (error) {
            console.log(error);
          }
        })
        .catch(error => {
          console.log(error);
        });
    },
    /**
     * table-column默认格式化方式
     * @param row 行数据
     * @param col 列数据
     * @param callValue 当前单元格数据
     * @return callValue/'-'
     * */
    defaultFormat(row, col, callValue) {
      return callValue ? callValue : "-";
    },
    /**
     * 时间戳格式化
     * @param row 行数据
     * @param col 列数据
     * @param timestamp 时间戳
     * @return "YYYY-MM-DD HH:mm:ss"
     * */
    dateFormat(row, col, timestamp) {
      if (!timestamp) return "-";
      let date = new Date(timestamp);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const day = date.getDate();
      const h = date.getHours();
      const m = date.getMinutes();
      const s = date.getSeconds();
      return `${year}-${this.addZero(month)}-${this.addZero(day)} ${this.addZero(h)}:${this.addZero(m)}:${this.addZero(
        s
      )}`;
    },
    /**
     * 时间戳格式化时不足两位数补0
     * @param num 原数据
     * @return "0+num,例如0+9=09"
     * */
    addZero(num) {
      if (num.toString().length > 1) {
        return num;
      } else {
        return "0" + num.toString();
      }
    },
    /**
     * 接收数据流生成blob，创建链接，下载模板，现在支持xls、zip,图片回头再试（走token）
     * @param url 导出表格的api地址(必传)
     * @param tempName 导出的文件名(必传)
     * @param params 导出的参数(默认为空)
     * @param isNotify 是否有导出消息提示(默认为false)
     * @param fileType 导出的文件格式(默认为.xls)
     */
    async downloadTemplate(url, tempName, params = {}, isNotify = false, fileType = ".xlsx") {
      if (isNotify) {
        this.$notify({
          title: "温馨提示",
          message: "如果数据庞大会导致下载缓慢哦，请您耐心等待！",
          type: "info",
          duration: 3000
        });
      }
      Object.assign(params, this.searchParam);
      // 导出数据时（点击文本框清空按钮删除对应空值的字段）
      delete params.dateRange;
      for (let key in params) {
        if (!params[key]) {
          delete params[key];
        }
      }
      try {
        const res = await this.$api[url](params);
        // 这个地方的type,经测试不传也没事，因为zip文件不知道type是什么
        const blob = new Blob([res], {
          type: "application/vnd.ms-excel;charset=UTF-8"
        });
        // const blob = new Blob([res]);
        // 兼容edge不支持createObjectURL方法
        if ("msSaveOrOpenBlob" in navigator) return window.navigator.msSaveOrOpenBlob(blob, tempName + fileType);
        const blobUrl = window.URL.createObjectURL(blob);
        this.download(blobUrl, tempName, fileType);
      } catch (error) {
        console.log(error);
      }
    },
    /**
     * 由生成的链接下载模板
     * @param blobUrl 二进制流地址(必传)
     * @param tempName 导出的文件名(必传)
     * @param fileType 导出的文件格式(默认为.xls)
     */
    download(blobUrl, tempName, fileType) {
      const exportFile = document.createElement("a");
      exportFile.style.display = "none";
      exportFile.download = `${tempName}${fileType}`;
      exportFile.href = blobUrl;
      document.body.appendChild(exportFile);
      exportFile.click();
      // 去除下载对url的影响
      document.body.removeChild(exportFile);
      window.URL.revokeObjectURL(blobUrl);
    }
  }
};
export default tablePage;
