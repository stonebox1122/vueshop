<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>系统管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
    </el-breadcrumb>

    <!--卡片视图区域-->
    <el-card>
      <!--搜索与添加区域-->
      <el-row :gutter="20">
        <el-col :span="3">
          <el-input placeholder="工号" v-model="queryInfo.query.username" clearable @clear="queryInfo.query.username=''"
                    style="width: 110px;">
            <!--<el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>-->
          </el-input>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="queryInfo.query.roleId"
            placeholder="角色"
            clearable
            @clear="queryInfo.query.roleId=''"
            style="width: 110px"
            @change=""
          >
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.description"
              :value="item.id"
            />
          </el-select>
        </el-col>
        <el-col :span="3">
          <el-select
            v-model="queryInfo.query.status"
            placeholder="状态"
            clearable
            @clear="queryInfo.query.status=''"
            style="width: 110px"
            @change=""
          >
            <el-option
              v-for="item in statusType"
              :key="item.key"
              :label="item.display_name"
              :value="item.key"
            />
          </el-select>
        </el-col>
        <el-col :span="8">
          <el-date-picker
            v-model="userSearch.createTime"
            :default-time="['00:00:00','23:59:59']"
            type="daterange"
            range-separator=":"
            value-format="yyyy-MM-dd HH:mm:ss"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            @clear="userSearch.createTime=''"
          />
        </el-col>
        <el-col :span="2" :offset="1">
          <el-button type="primary" @click="searchUser()">搜索</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="resetSearch()">重置</el-button>
        </el-col>
      </el-row>
      <el-row :gutter="5">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加用户</el-button>
        </el-col>
      </el-row>
      <!--用户列表区域-->
      <el-table :data="userlist" stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="工号" prop="username" align="center"></el-table-column>
        <el-table-column label="角色" prop="roles[0].description" align="center"></el-table-column>
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
                       @change="userStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="190px" align="center">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip effect="dark" content="重置密码" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeUserById(scope.row.id)"></el-button>
            </el-tooltip>
            <!--分配角色按钮-->
            <el-tooltip effect="dark" content="分配角色" placement="top-start" :enterable="false">
              <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRole(scope.row)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <!--分页区域-->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[1, 2, 5, 10]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!--添加用户对话框-->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="工号" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="addForm.roleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.description"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改用户对话框-->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="工号">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" v-model.trim="editForm.password" placeholder="请输入重置密码"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!--分配角色对话框-->
    <el-dialog
      title="分配角色"
      :visible.sync="setRoleDialogVisible"
      width="50%" @close="setRoleDialogClosed">
      <div v-if="userInfo.roles">
        <p>当前的用户：{{userInfo.username}}</p>
        <p>当前的角色：{{userInfo.roles[0].description}}</p>
        <p>分配新角色：
          <el-select v-model="selectedRoleId" placeholder="请选择">
            <el-option
              v-for="item in roleList"
              :key="item.id"
              :label="item.description"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRoleDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: 'user',
    data() {
      // 验证邮箱的规则
      var checkEmail = (rule, value, cb) => {
        const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
        if (regEmail.test(value)) {
          return cb()
        }
        cb(new Error('请输入正确的邮箱'))
      }
      // 验证手机的规则
      var checkMobile = (rule, value, cb) => {
        const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
        if (regMobile.test(value)) {
          return cb()
        }
        cb(new Error('请输入正确的手机'))
      }
      return {
        // 获取用户列表的参数对象
        queryInfo: {
          query: {
            username: '',
            roleId: '',
            status: '',
            beginCreateTime: '',
            endCreateTime: ''
          },
          // 当前页数
          pagenum: 1,
          // 当前每页显示多少条数据
          pagesize: 5
        },
        userSearch: {
          createTime: ''
        },
        userlist: [],
        total: 0,
        // 控制添加用户对话框的显示与隐藏
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          roleId: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ],
          mobile: [
            {required: true, message: '请输入手机', trigger: 'blur'},
            {validator: checkMobile, trigger: 'blur'}
          ]
        },
        // 控制修改用户对话框的显示与隐藏
        editDialogVisible: false,
        // 查询到的用户信息对象
        editForm: {
          password: ''
        },
        // 修改表单的验证规则对象
        editFormRules: {
          password: [
            {required: true, message: '请输入密码', trigger: 'blur'},
            {min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur'}
          ]
        },
        // 控制分配角色对话框的显示与隐藏
        setRoleDialogVisible: false,
        // 需要被分配角色的用户信息
        userInfo: {},
        // 所有角色数据列表
        roleList: [],
        // 已选中的角色名称
        selectedRoleId: '',
        // 用户状态
        statusType: [
          {key: 0, display_name: '停用'},
          {key: 1, display_name: '启用'}
        ]
      }
    },
    created() {
      this.getUserList()
      this.getRoleList()
    },
    methods: {
      async getUserList() {
        // const {data: res} = await this.$http.get('user', {params: this.queryInfo})
        // console.log(res)
        if (this.userSearch.createTime != null && this.userSearch.createTime.length == 2) {
          this.queryInfo.query.beginCreateTime = this.userSearch.createTime[0]
          this.queryInfo.query.endCreateTime = this.userSearch.createTime[1]
        }
        //console.log(this.userSearch)
        const {data: res} = await this.$http.get(`user/search/${this.queryInfo.pagenum}/${this.queryInfo.pagesize}`, {params: this.queryInfo.query})
        if (res.status !== 200) return this.$message.error('获取用户列表失败')
        this.userlist = res.data.rows
        this.total = res.data.total
      },
      async getRoleList() {
        const {data: res} = await this.$http.get('role')
        if (res.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.roleList = res.data
      },
      // 监听pagesize改变的事件
      handleSizeChange(newSize) {
        // console.log(newSize)
        this.queryInfo.pagesize = newSize
        this.getUserList()
      },
      // 监听页码值改变的事件
      handleCurrentChange(newPage) {
        // console.log(newPage)
        this.queryInfo.pagenum = newPage
        this.getUserList()
      },
      // 监听switch开关状态的改变
      async userStatusChanged(userinfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`user/${userinfo.id}/status/${userinfo.status}`)
        if (res.status !== 200) {
          userinfo.status = !userinfo.status
          return this.$message.error('更新用户状态失败')
        }
        this.$message.success('更新用户状态成功')
        // 重新获取用户数据
        this.getUserList()
      },
      // 监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 展示增加用户的对话框
      async showAddDialog() {
        // 在展示对话框之前获取所有角色列表
        this.getRoleList()
        this.addDialogVisible = true
      },
      currSelected(selVal) {
        this.addForm.roles = this.roleList.find((item) => item.id == selVal)
      },
      // 点击按钮，添加新用户
      addUser() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          const {data: res} = await this.$http.post('user', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加用户失败')
          }
          this.$message.success('添加用户成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户数据
          this.getUserList()
        })
      },
      // 展示编辑用户的对话框
      async showEditDialog(id) {
        // console.log(id)
        const {data: res} = await this.$http.get('user/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询用户信息失败')
        }
        this.editForm = res.data
        this.editForm.password = ""
        this.editDialogVisible = true
      },
      // 监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，修改用户
      editUser() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起修改用户的网络请求
          const {data: res} = await this.$http.put('user/' + this.editForm.id, this.editForm)
          if (res.status !== 200) {
            this.$message.error('修改用户失败')
          }
          this.$message.success('修改用户成功')
          // 隐藏添加用户的对话框
          this.editDialogVisible = false
          // 重新获取用户数据
          this.getUserList()
        })
      },
      // 根据Id删除对应的用户信息
      async removeUserById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('user/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getUserList()
      },
      // 展示分配角色对话框
      async setRole(userInfo) {
        this.userInfo = userInfo
        // 在展示对话框之前获取所有角色列表
        const {data: res} = await this.$http.get('role')
        if (res.status !== 200) {
          return this.$message.error('获取角色列表失败')
        }
        this.roleList = res.data
        this.setRoleDialogVisible = true
      },
      // 点击按钮分配角色
      async saveRoleInfo() {
        if (!this.selectedRoleId) {
          return this.$message.error('请选择要分配的角色')
        }
        const {data: res} = await this.$http.put(`user/${this.userInfo.id}/role/${this.selectedRoleId}`)
        if (res.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        this.getUserList()
        this.setRoleDialogVisible = false
      },
      // 监听分配角色对话框的关闭事件
      setRoleDialogClosed() {
        this.selectedRoleId = ''
        this.userInfo = {}
      },
      resetSearch() {
        this.queryInfo.query.username = ''
        this.queryInfo.query.roleId = ''
        this.queryInfo.query.status = ''
        this.queryInfo.query.beginCreateTime = ''
        this.queryInfo.query.endCreateTime = ''
        this.userSearch.createTime = ''
        this.queryInfo.pagenum = 1
        this.getUserList()
      },
      async searchUser() {
        // if (this.userSearch.createTime != null && this.userSearch.createTime.length == 2) {
        //   this.queryInfo.query.beginCreateTime = this.userSearch.createTime[0]
        //   this.queryInfo.query.endCreateTime = this.userSearch.createTime[1]
        // }
        // const {data: res} = await this.$http.get(`user/search/${this.queryInfo.pagenum}/${this.queryInfo.pagesize}`, {params: this.queryInfo.query})
        // if (res.status !== 200) return this.$message.error('获取用户列表失败')
        // this.userlist = res.data.rows
        // this.total = res.data.total
        this.queryInfo.pagenum = 1
        this.getUserList()
      }
    }
  }
</script>

<style lang="less" scoped>
  .el-row {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }
  }
</style>
