<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>图标管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <el-row :gutter="5">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加图标</el-button>
        </el-col>
      </el-row>
      <!--图标列表区域-->
      <el-table :data="iconList" stripe>
        <el-table-column label="序号" prop="id" align="center"></el-table-column>
        <el-table-column label="名称" prop="name" align="center"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="图标" prop="name"  align="center">
          <template slot-scope="scope">
            <i :class="scope.row.name"></i>
          </template>
        </el-table-column>

        <el-table-column label="操作" width="190px" align="center">
          <template slot-scope="scope">
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeIconById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加图标对话框-->
    <el-dialog
      title="添加图标"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed" :close-on-click-modal='false'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addIcon">确 定</el-button>
      </span>
    </el-dialog>

  </div>
</template>

<script>
  export default {
    name: "Icon",
    data () {
      return {
        iconList: [],
        // 控制添加图标对话框的显示与隐藏
        addDialogVisible: false,
        // 添加图标的表单数据
        addForm: {
          name: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          name: [
            {required: true, message: '请输入图标名称', trigger: 'blur'},
            {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created () {
      this.getIconList()
    },
    methods: {
      async getIconList () {
        const { data: res } = await this.$http.get('icon')
        if (res.status !== 200) return this.$message.error(res.message)
        this.iconList = res.data
        // console.log(res)
      },
      // 根据Id删除对应的图标
      async removeIconById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该图标, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('icon/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除图标失败')
        }
        this.$message.success('删除图标成功')
        this.getIconList()
      },
      // 展示增加图标的对话框
      async showAddDialog() {
        this.addDialogVisible = true
      },
      // 点击按钮，添加图标
      addIcon() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          const {data: res} = await this.$http.post('icon', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加图标失败')
          }
          this.$message.success('添加图标成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户数据
          this.getIconList()
        })
      },
      // 监听添加图标对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      }
    }
  }
</script>

<style scoped>

</style>
