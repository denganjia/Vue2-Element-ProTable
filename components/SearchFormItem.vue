<!--<template>-->
<!--  <div>-->
<!--    <template v-if="target === 'text'">-->
<!--      <el-input v-model="bindValue" :clearable="clearable" placeholder="请输入"></el-input>-->
<!--    </template>-->
<!--    <template v-else-if="target === 'select'">-->
<!--      <el-select v-model="bindValue" :clearable="clearable">-->
<!--        <el-option-->
<!--            v-for="(item, index) in customOption"-->
<!--            :key="index"-->
<!--            :label="item.label"-->
<!--            :value="item.value"-->
<!--        ></el-option>-->
<!--      </el-select>-->
<!--    </template>-->
<!--    <template v-else-if="target === 'datetimerange'">-->
<!--      <el-date-picker-->
<!--          v-model="bindValue"-->
<!--          end-placeholder="结束日期"-->
<!--          range-separator="至"-->
<!--          start-placeholder="开始日期"-->
<!--          type="datetimerange"-->
<!--          value-format="timestamp"-->
<!--          :clearable="clearable"-->
<!--      >-->
<!--      </el-date-picker>-->
<!--    </template>-->
<!--    <template v-else-if="target === 'date'">-->
<!--      <el-date-picker-->
<!--          v-model="bindValue"-->
<!--          placeholder="选择日期"-->
<!--          type="date"-->
<!--          value-format="yyyy-MM-dd"-->
<!--          :clearable="clearable"-->
<!--      ></el-date-picker>-->
<!--    </template>-->
<!--    <template v-else-if="target === 'time'">-->
<!--      <el-time-picker-->
<!--          v-model="bindValue"-->
<!--          placeholder="选择时间"-->
<!--          value-format="timestamp"-->
<!--          :clearable="clearable"-->
<!--      >-->
<!--      </el-time-picker>-->
<!--    </template>-->
<!--    <template v-else-if="target === 'timerange'">-->
<!--      <div>-->
<!--        <el-time-picker-->
<!--            style="width: auto"-->
<!--            is-range-->
<!--            v-model="bindValue"-->
<!--            range-separator="至"-->
<!--            start-placeholder="开始时间"-->
<!--            end-placeholder="结束时间"-->
<!--            placeholder="选择时间范围"-->
<!--            :clearable="clearable"-->
<!--        >-->
<!--        </el-time-picker>-->
<!--      </div>-->
<!--    </template>-->
<!--    <template v-else-if="target === 'datetime'">-->
<!--      <el-date-picker-->
<!--          v-model="bindValue"-->
<!--          placeholder="选择日期"-->
<!--          type="datetime"-->
<!--          value-format="timestamp"-->
<!--          :clearable="clearable"-->
<!--      ></el-date-picker>-->
<!--    </template>-->
<!--  </div>-->
<!--</template>-->

<script>
export default {
  name: "SearchFromItem",
  model: {
    prop: "value",
    event: "update"
  },
  props: {
    target: {
      type: String,
      validator: function (value) {
        // 这个值必须匹配下列字符串中的一个
        return ["text", "select", "datetimerange", "date", "time", "datetime", "timerange"].indexOf(value) !== -1;
      }
    },
    size: String,
    value: [String, Number, Array, Date],
    option: [Array, Promise, Function],
    index: String,
    clearable: {
      type: Boolean,
      default: true
    },
    maxDate: Number,
    minDate: Number
  },
  data() {
    return {
      select: "",
      customOption: [],
      datePickerOption: {}
    };
  },
  computed: {
    bindValue: {
      get() {
        return this.value;
      },
      set(value) {
        // this.$emit("update", this.index, value);
        this.$emit("update", value);
      }
    }
  },
  methods: {
    async getOption() {
      if (Array.isArray(this.option)) {
        this.customOption = this.option;
      } else {
        this.customOption = await this.option();
      }
    }
  },
  created() {
    this.getOption();
  },
  render(createElement) {
    if (this.target === "text") {
      return createElement("el-input", {
        attrs: {
          placeholder: "请输入"
        },
        props: { value: this.bindValue, clearable: this.clearable },
        on: {
          input: value => {
            this.bindValue = value;
          }
        }
      });
    } else if (this.target === "select") {
      return createElement(
        "el-select",
        {
          attrs: { placeholder: "请选择" },
          props: {
            value: this.bindValue,
            clearable: this.clearable
          },
          on: {
            change: value => {
              this.bindValue = value;
            }
          }
        },
        [
          ...this.customOption.map(item => {
            return createElement("el-option", { props: { label: item.label, value: item.value } });
          })
        ]
      );
    } else if (this.target === "date") {
      return createElement("el-date-picker", {
        attrs: {
          placeholder: "请选择"
        },
        props: {
          value: this.bindValue,
          clearable: this.clearable,
          type: "date",
          "value-format": "yyyy-MM-dd",
          "picker-options": this.maxDate
            ? {
                disabledDate: time => {
                  return time.getTime() > this.maxDate;
                }
              }
            : {}
        },
        on: {
          input: value => {
            this.bindValue = value;
          }
        }
      });
    } else if (this.target === "datetimerange") {
      return createElement("el-datetimerange", {
        attrs: { "end-placeholder": "结束日期", "start-placeholder": "开始日期", "range-separator": "至" },
        props: {
          value: this.bindValue,
          clearable: this.clearable,
          type: "datetimerange",
          "value-format": "timestamp"
        },
        on: {
          input: value => {
            this.bindValue = value;
          }
        }
      });
    } else if (this.target === "timerange") {
      return createElement("el-time-picker", {
        attrs: {
          placeholder: "请选择",
          "start-placeholder": "开始时间",
          "range-separator": "至",
          "end-placeholder": "结束时间"
        },
        props: { value: this.bindValue, "is-range": true, clearable: this.clearable },
        on: {
          input: value => {
            this.bindValue = value;
          }
        }
      });
    } else if (this.target === "datetime") {
      return createElement("el-date-picker", {
        attrs: { placeholder: "请选择" },
        props: {
          value: this.bindValue,
          clearable: this.clearable,
          type: "datetime"
        },
        on: {
          input: value => {
            this.bindValue = value;
          }
        }
      });
    } else if (this.target === "time") {
      return createElement("el-time-picker", {
        attrs: { placeholder: "选择时间" },
        props: { value: this.bindValue, clearable: this.clearable },
        on: {
          input: value => {
            this.bindValue = value;
          }
        }
      });
    } else {
      return createElement("p");
    }
  }
};
</script>

<style scoped>
::v-deep .el-select {
  width: 100%;
}

::v-deep .el-date-editor.el-input {
  width: 100%;
}
</style>
