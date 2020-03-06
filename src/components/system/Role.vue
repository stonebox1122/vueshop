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
          <el-button type="primary" @click="showAddDialog()">添加角色</el-button>
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
            <el-tooltip effect="dark" content="修改权限" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini"
                         @click="showEditPermissionDialog(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加角色对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed" :close-on-click-modal='false'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="addForm.description"></el-input>
        </el-form-item>
      </el-form>
      <div class="perTree">
        <p>权限</p>
        <!--树形控件-->
        <el-tree :data="permissionList" :props="treeProps" show-checkbox node-key="id"
                 default-expand-all ref="treeRef"></el-tree>
      </div>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改角色对话框-->
    <el-dialog
      title="修改角色"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed" :close-on-click-modal='false'>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="名称">
          <el-input v-model="editForm.name" prop="name"></el-input>
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
    <!--修改权限的对话框-->
    <el-dialog
      title="修改权限"
      :visible.sync="editPermissionDialogVisible"
      width="50%" @close="editPermissionDialogClosed" :close-on-click-modal='false'>
      <!--树形控件-->
      <el-tree :data="permissionList" :props="treeProps" show-checkbox node-key="id"
               default-expand-all :default-checked-keys="defKeys" ref="treeRef2"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editPermissionDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPermissions">确 定</el-button>
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
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        addForm: {
          name: '',
          description: '',
          permissionIds: ''
        },
        // 添加角色表单的验证规则对象
        addFormRules: {
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ],
          description: [
            {required: true, message: '请输入角色描述', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ]
        },
        // 添加角色对话框中选中的权限Id值数组
        addKeys: [1],
        // 控制修改角色对话框的显示与隐藏
        editDialogVisible: false,
        editForm: {
          name: '',
          description: ''
        },
        // 修改权限表单的验证规则对象
        editFormRules: {
          name: [
            {required: true, message: '请输入角色名称', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ],
          description: [
            {required: true, message: '请输入角色描述', trigger: 'blur'},
            {min: 1, max: 20, message: '长度在 1 到 20 个字符', trigger: 'blur'}
          ]
        },
        // 控制修改权限对话框显示与隐藏
        editPermissionDialogVisible: false,
        // 所有权限的数据
        permissionList: [],
        // 树形控件的属性绑定对象
        treeProps: {
          label: 'name',
          children: 'children'
        },
        // 角色选中的节点Id值数组
        defKeys: [],
        // 当前即将修改权限的角色id
        roleId: '',
        rolePermissionList: []
      }
    },
    created() {
      this.getRoleList()
    },
    methods: {
      // 展示增加角色的对话框
      showAddDialog() {
        // 在展示对话框之前获取所有权限列表
        this.getPermissionList()
        this.addDialogVisible = true
      },
      // 获取所有权限列表
      async getPermissionList() {
        const {data: res} = await this.$http.get('permission/tree')
        if (res.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        this.permissionList = res.data
      },
      // 监听添加角色对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加新角色
      addRole() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          this.addKeys = this.$refs.treeRef.getHalfCheckedKeys().concat(this.$refs.treeRef.getCheckedKeys())
          this.addForm.permissionIds = this.addKeys.join(',')
          // 预校验通过，可以发起添加角色的网络请求
          const {data: res} = await this.$http.post('role', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加角色失败')
          }
          this.$message.success('添加角色成功')
          // 隐藏添加角色的对话框
          this.addDialogVisible = false
          // 重新获取角色数据
          this.getRoleList()
        })
      },
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
      // 展示修改权限的对话框
      showEditPermissionDialog(roleId) {
        // 获取当前角色的权限id数组和所有权限的数据
        // this.getDefKeys(roleId).then(value => {
        //   this.getPermissionList()
        // })
        this.$http.all([this.getDefKeys(roleId), this.getPermissionList()])

        this.editPermissionDialogVisible = true
      },
      // 获取角色的三级权限的id，并保存到defKeys数组中
      async getDefKeys(roleId) {
        this.roleId = roleId
        const {data: res} = await this.$http.get('rolePermission/role/' + roleId)
        if (res.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        res.data.forEach(item => this.defKeys.push(item.permissionId))
      },
      // 监听分配权限对话框的关闭事件
      editPermissionDialogClosed() {
        this.defKeys = []
      },
      async editPermissions() {
        const keys = [
          ...this.$refs.treeRef2.getCheckedKeys(),
          ...this.$refs.treeRef2.getHalfCheckedKeys()
        ]
        // console.log(keys)
        keys.forEach(item => {
          var rolePermission = {
            'roleId': '',
            'permissionId': ''
          }
          rolePermission.roleId = this.roleId
          rolePermission.permissionId = item
          this.rolePermissionList.push(rolePermission)
        })
        // console.log(this.rolePermissionList)
        const {data: res} = await this.$http.post('rolePermission/role/' + this.roleId, this.rolePermissionList)
        if (res.status !== 200) {
          return this.$message.error('修改角色权限失败')
        }
        this.$message.success('修改角色权限成功')
        // 隐藏修改角色权限的对话框
        this.editPermissionDialogVisible = false
        this.rolePermissionList = []
      },
      // 点击为角色分配权限
      async allotPermissions() {
        const keys = [
          ...this.$refs.treeRef.getCheckedKeys(),
          ...this.$refs.treeRef.getHalfCheckedKeys()
        ]
        const idStr = keys.join(',')
        const {data: res} = await this.$http.p
        ost(`roles/${this.roleId}/rights`, {rids: idStr})
        if (res.status !== 200) {
          return this.$message.error('分配权限失败')
        }
        this.$message.success('分配权限成功')
        this.getRoleList()
        this.editPermissionDialogVisible = false
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

  .perTree {
    margin-left: 30px;
    p {
      padding: 0 12px 0 0;
    }
  }
</style>
