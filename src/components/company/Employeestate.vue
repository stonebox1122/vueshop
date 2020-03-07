<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>公司管理</el-breadcrumb-item>
      <el-breadcrumb-item>员工状态</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row :gutter="5">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加状态</el-button>
        </el-col>
      </el-row>
      <!--图标列表区域-->
      <el-table :data="stateList" stripe>
        <el-table-column label="序号" prop="id" align="center"></el-table-column>
        <el-table-column label="状态" prop="state" align="center"></el-table-column>

        <el-table-column label="操作" width="190px" align="center">
          <template slot-scope="scope">
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeStateById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加图标对话框-->
    <el-dialog
      title="添加状态"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed" :close-on-click-modal='false'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="状态" prop="state">
          <el-input v-model="addForm.state"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addState">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "Employeestate",
    data () {
      return {
        stateList: [],
        // 控制添加图标对话框的显示与隐藏
        addDialogVisible: false,
        // 添加图标的表单数据
        addForm: {
          state: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          state: [
            {required: true, message: '请输入状态名称', trigger: 'blur'},
            {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created () {
      this.getStateList()
    },
    methods: {
      async getStateList () {
        const { data: res } = await this.$http.get('employeestate')
        if (res.status !== 200) return this.$message.error(res.message)
        this.stateList = res.data
        // console.log(res)
      },
      // 根据Id删除对应的状态
      async removeStateById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该状态, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('employeestate/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除状态失败')
        }
        this.$message.success('删除状态成功')
        this.getStateList()
      },
      // 展示增加图标的对话框
      async showAddDialog() {
        this.addDialogVisible = true
      },
      // 点击按钮，添加状态
      addState() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          const {data: res} = await this.$http.post('employeestate', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加状态失败')
          }
          this.$message.success('添加状态成功')
          // 隐藏添加状态的对话框
          this.addDialogVisible = false
          // 重新获取状态数据
          this.getStateList()
        })
      },
      // 监听添加状态对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      }
    }
  }
</script>

<style scoped>

</style>
