<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--添加角色按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary">添加角色</el-button>
        </el-col>
      </el-row>
      <!--角色列表区域-->
      <el-table :data="roleList" stripe>
        <el-table-column label="名称" prop="name" align="center"></el-table-column>
        <el-table-column label="描述" prop="description" align="center"></el-table-column>
        <el-table-column label="创建时间" prop="createTime" align="center">
          <template slot-scope="scope">
            {{scope.row.createTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" prop="updateTime" align="center">
          <template slot-scope="scope">
            {{scope.row.updateTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                       @change="roleStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px" align="center">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip effect="dark" content="修改角色" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeRoleById(scope.row.id)"></el-button>
            </el-tooltip>
            <!--分配权限按钮-->
            <el-tooltip effect="dark" content="分配权限" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="showSetPermissionDialog(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--修改角色对话框-->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配权限的对话框-->
    <el-dialog
      title="分配权限"
      :visible.sync="setPermissionDialogVisible"
      width="50%" @close="setPermissionDialogClosed">
      <!--树形控件-->
      <el-tree :data="permissionList" :props="treeProps" show-checkbox node-key="id"
               default-expand-all :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setPermissionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotPermissions">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Roles",
    data() {
      return {
        // 所有角色列表数据
        roleList: [],
        editForm: {
          name: '',
          description: ''
        },
        // 控制修改角色对话框的显示与隐藏
        editDialogVisible: false,
        // 修改权限表单的验证规则对象
        editFormRules: {
          name: [
            {required: true, message: '请输入权限名称', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ],
          description: [
            {required: true, message: '请输入权限描述', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ]
        },
        // 控制分配权限对话框显示与隐藏
        setPermissionDialogVisible: false,
        // 所有权限的数据
        permissionList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          label: 'name',
          children: 'children'
        },
        // 默认选中的节点Id值数组
        defKeys: [],
        // 当前即将分配权限的角色id
        roleId: ''
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      // 获取所有角色列表
      async getRoleList() {
        const {data: res} = await this.$http.get('role')
        if (res.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.roleList = res.data
      },
      // 监听switch开关状态的改变
      async roleStatusChanged(roleInfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`role/${roleInfo.id}/status/${roleInfo.status}`)
        if (res.status !== 200) {
          roleInfo.status = !roleInfo.status
          return this.$message.error('更新角色状态失败')
        }
        this.$message.success('更新角色状态成功')
        // 重新获取用户数据
        this.getRoleList()
      },
      // 展示编辑角色的对话框
      async showEditDialog(id) {
        // console.log(id)
        const {data: res} = await this.$http.get('role/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询用户信息失败')
        }
        this.editForm = res.data
        this.editDialogVisible = true
      },
      // 监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，修改角色
      editRole() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起修改用户的网络请求
          const {data: res} = await this.$http.put('role/' + this.editForm.id, this.editForm)
          if (res.status !== 200) {
            this.$message.error('修改角色失败')
          }
          this.$message.success('修改角色成功')
          // 隐藏添加用户的对话框
          this.editDialogVisible = false
          // 重新获取用户数据
          this.getRoleList()
        })
      },
      // 根据Id删除对应的角色
      async removeRoleById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该角色, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('role/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除角色失败')
        }
        this.$message.success('删除角色成功')
        this.getRoleList()
      },
      // 根据Id删除对应的权限
      async removePermissionById(role, rightId) {
        // 弹框提示用户是否删除
        const confirmResult = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
        if (res.status !== 200) {
          return this.$message.error('删除权限失败')
        }
        this.$message.success('删除权限成功')
        role.children = res.data
      },
      // 展示分配权限的对话框
      async showSetPermissionDialog(role) {
        this.roleId = role.id
        // 获取所有权限的数据
        const {data: res} = await this.$http.get('permission/tree')
        if (res.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        this.permissionList = res.data
        // console.log(this.rightsList)
        // 递归获取三级节点的id
        this.getLeafKeys(role, this.defKeys)
        console.log(this.permissionList)
        console.log(this.defKeys)
        this.setPermissionDialogVisible = true
      },
      // 通过递归的形式，获取角色下所有三级权限的id，并保存到defKeys数组中
      getLeafKeys(node, arr) {
        // 如果当前node节点不包含children属性，则是三级节点
        if (!node.children) {
          return arr.push(node.id)
        }
        // 如果当前node节点包含children属性，则递归
        node.children.forEach(item => this.getLeafKeys(item, arr))
      },
      // 监听分配权限对话框的关闭事件
      setPermissionDialogClosed() {
        this.defKeys = []
      },
      // 点击为角色分配权限
      async allotPermissions() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, {rids: idStr})
        if (res.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRoleList()
        this.setPermissionDialogVisible = false
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-tag {
    margin: 7px;
  }

  .bdtop {
    border-top: 1px solid #eee;
  }

  .bdbotton {
    border-bottom: 1px solid #eee;
  }

  .vcenter {
    display: flex;
    align-items: center;
  }
</style>
