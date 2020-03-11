<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>公司管理</el-breadcrumb-item>
      <el-breadcrumb-item>部门列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--搜索区域-->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-cascader
            v-model="searchOrganizationId"
            :options="organizationList"
            :props="searchProps"
            style="width:390px;"
            clearable></el-cascader>
        </el-col>
        <el-col :span="2" :offset="1">
          <el-button type="primary" @click="searchDepartment()">搜索</el-button>
        </el-col>
        <el-col :span="2">
          <el-button type="primary" @click="resetSearch()">重置</el-button>
        </el-col>
      </el-row>
      <!--添加部门按钮-->
      <el-row :gutter="5">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加部门</el-button>
        </el-col>
      </el-row>

      <!--部门列表区域-->
      <el-table ref="table" :data="departmentList" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" style="width: 100%;margin-bottom: 20px;" default-expand-all>
        <el-table-column :show-overflow-tooltip="true" label="部门名称" prop="name" fixed width="200"/>
        <el-table-column :show-overflow-tooltip="true" label="部门编码" prop="code" align="center" width="100"/>
        <el-table-column :show-overflow-tooltip="true" label="组织名称" prop="organizationName" align="center" width="200"/>
        <el-table-column :show-overflow-tooltip="true" label="部门主管" prop="employeeName" align="center"/>

        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                       @change="departmentStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="创建时间" prop="createTime" align="center" width="150">
          <template slot-scope="scope">
            {{scope.row.createTime | dateFormat}}
          </template>
        </el-table-column>
        <el-table-column label="修改时间" prop="updateTime" align="center" width="150">
          <template slot-scope="scope">
            {{scope.row.updateTime | dateFormat}}
          </template>
        </el-table-column>

        <el-table-column label="操作" width="120px" align="center" fixed="right">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip effect="dark" content="修改" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeDepartmentById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加部门对话框-->
    <el-dialog
      title="添加部门"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed" :close-on-click-modal='false'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="addForm.name"/>
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="addForm.code"/>
        </el-form-item>
        <el-form-item label="所属组织" prop="organizationId">
          <el-cascader
            v-model="addForm.organizationId"
            :options="organizationList"
            :props="organizationProps"
            style="width:390px;"
            clearable @change="handleChange"></el-cascader>
        </el-form-item>
        <el-form-item label="上级部门" prop="pid">
          <el-cascader
            v-model="addForm.pid"
            :options="departmentListByOrganizationId"
            :props="departmentProps"
            :disabled="optionsChanged"
            :placeholder="departmentPlaceholder"
            style="width:390px;"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="部门主管" prop="managerId">
          <el-select v-model="addForm.managerId" placeholder="请选择" filterable>
            <el-option
              v-for="item in managerList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
              <span style="float: left">{{ item.name}}</span>
              <span style="float: right">{{ item.usernmae }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addDepartment">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改部门对话框-->
    <el-dialog
      title="修改部门"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed" :close-on-click-modal='false'>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="editForm.name"/>
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="editForm.code" :disabled="true"/>
        </el-form-item>
        <el-form-item label="所属组织" prop="organizationId">
          <el-cascader
            v-model="editForm.organizationId"
            :options="organizationList"
            :props="organizationProps"
            style="width:390px;"
            clearable :disabled="true"></el-cascader>
        </el-form-item>
        <el-form-item label="上级部门" prop="pid">
          <el-cascader
            v-model="editForm.pid"
            :options="departmentList"
            :props="departmentProps"
            style="width:390px;"
            clearable :disabled="true"></el-cascader>
        </el-form-item>
        <el-form-item label="部门主管" prop="managerId">
          <el-select v-model="editForm.managerId" placeholder="请选择" filterable>
            <el-option
              v-for="item in managerList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
              <span style="float: left">{{ item.name}}</span>
              <span style="float: right">{{ item.usernmae }}</span>
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editDepartment">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  // import the component
  import Treeselect from '@riophae/vue-treeselect'
  // import the styles
  import '@riophae/vue-treeselect/dist/vue-treeselect.css'

  export default {
    components: { Treeselect },
    name: "Department",
    data() {
      // 验证编码唯一性规则
      var checkUnique = (rule, value, cb) => {
        this.existsCode = false
        this.validateCode(this.departmentList,value)
        if (this.existsCode === false) {
          return cb()
        }
        cb(new Error('请输入不重复的部门编码'))
      }
      return {
        searchOrganizationId: '',
        searchProps: {
          value: 'id',
          label: 'name',
          children: 'children',
          expandTrigger: "hover",
          checkStrictly: true,
          emitPath: false
        },
        departmentList: [],
        // 指定级联选择器的配置对象
        departmentProps: {
          value: 'id',
          label: 'name',
          children: 'children',
          expandTrigger: "hover",
          checkStrictly: true
        },
        organizationList: [],
        // 指定级联选择器的配置对象
        organizationProps: {
          value: 'id',
          label: 'name',
          children: 'children',
          expandTrigger: "hover",
          checkStrictly: true
        },
        managerList: [],
        departmentListByOrganizationId: [],
        optionsChanged: false,
        departmentPlaceholder: '请选择',
        // 控制添加部门对话框的显示与隐藏
        addDialogVisible: false,
        // 添加部门的表单数据
        addForm: {
          name: '',
          code: '',
          pid: '',
          organizationId: '',
          managerId: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          name: [
            {required: true, message: '请输入部门名称', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入部门编码', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'},
            {validator: checkUnique, trigger: ['blur', 'change']}
          ],
          organizationId: [
            {required: true, message: '请选择所属组织', trigger: 'blur'}
          ]
        },
        existsCode: false,
        // 控制修改部门对话框的显示与隐藏
        editDialogVisible: false,
        // 修改部门的表单信息
        editForm: {
          name: '',
          code: '',
          pid: '',
          organizationId: '',
          managerId: ''
        },
        editFormRules: {
          name: [
            {required: true, message: '请输入部门名称', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入部门编码', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getDepartmentList()
      this.getOrganizationList()
    },
    methods: {
      async getDepartmentList() {
        const {data: res} = await this.$http.get('department/tree')
        if (res.status !== 200) {
          return this.$message.error('获取部门架构失败')
        }
        this.departmentList = res.data
        this.removeChildren(this.departmentList)
      },
      async getOrganizationList() {
        const {data: res} = await this.$http.get('organization/tree')
        if (res.status !== 200) {
          return this.$message.error('获取组织架构失败')
        }
        this.organizationList = res.data
        this.removeChildren(this.organizationList)
      },
      removeChildren(arr) {
        arr.forEach(item => {
          if (item.children.length === 0) {
            delete item.children
          } else if (item.children.length > 0){
            this.removeChildren(item.children)
          }
        })
      },
      validateCode(arr, code) {
        arr.some(item => {
          if (item.code === code) {
            this.existsCode = true
            return true;
          } else if (item.children){
            this.validateCode(item.children, code)
          }
        })
      },
      // 展示增加部门的对话框
      async showAddDialog() {
        this.getOrganizationList()
        this.addDialogVisible = true
      },
      // 根据选择的组织获取该组织下的部门列表和管理人员列表
      async getDepartmentListByOrganizationId(organizationId) {
        const {data: res} = await this.$http.get('department/tree/' + organizationId)
        if (res.status !== 200) {
          return this.$message.error('获取部门架构失败')
        }
        if (res.data.length === 0) {
          this.optionsChanged = true
          this.departmentPlaceholder = '暂无部门'
          return
        }
        this.departmentListByOrganizationId = res.data
        this.removeChildren(this.departmentListByOrganizationId)
      },
      async getManagerListByOrganizationId(organizationId) {
        const {data: res} = await this.$http.get('employee/manager/' + organizationId)
        if (res.status !== 200) {
          return this.$message.error('获取主管列表失败')
        }
        this.managerList = res.data
      },
      handleChange() {
        this.addForm.pid = []
        this.optionsChanged = false
        this.departmentPlaceholder = '请输入'
        if (this.addForm.organizationId.length > 0) {
          const organizationId = this.addForm.organizationId[this.addForm.organizationId.length - 1]
          this.getDepartmentListByOrganizationId(organizationId)
          this.getManagerListByOrganizationId(organizationId)
        }
      },
      // 监听添加部门对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加部门
      addDepartment() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          if (this.addForm.pid.length === 0) {
            this.addForm.pid = 0
          }  else {
            this.addForm.pid = this.addForm.pid[this.addForm.pid.length-1]
          }
          if (this.addForm.organizationId === '') {
            this.addForm.organizationId = 0
          }  else {
            this.addForm.organizationId = this.addForm.organizationId[this.addForm.organizationId.length-1]
          }
          const {data: res} = await this.$http.post('department', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加部门失败')
          }
          this.$message.success('添加部门成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户数据
          this.getDepartmentList()
        })
      },
      // 监听switch开关状态的改变
      async departmentStatusChanged(departmentInfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`department/${departmentInfo.id}/status/${departmentInfo.status}`)
        if (res.status !== 200) {
          departmentInfo.status = !departmentInfo.status
          return this.$message.error('更新部门状态失败')
        }
        this.$message.success('更新部门状态成功')
        // 重新获取用户数据
        this.getDepartmentList()
      },
      // 获取指定Id的部门
      async getDepartmentItem(id) {
        const {data: res} = await this.$http.get('department/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询部门信息失败')
        }
        this.editForm = res.data
      },
      // 获取指定Id部门所在组织的所有管理人员列表
      getManagerListByDepartmentId() {

      },
      // 展示编辑部门的对话框
      async showEditDialog(id) {
        this.getDepartmentItem(id)
        this.getOrganizationList()
        // this.$http.all([this.getDepartmentItem(id), this.getDepartmentList()])
        // this.disableCascadeItem(this.departmentList, id)
        // console.log(this.departmentList)
        this.editDialogVisible = true
      },
      // 递归遍历部门列表，将编辑对话框级联选项中与当前id相同的项禁用
      disableCascadeItem(arr, id) {
        arr.forEach(item => {
          if (item.id === id) {
            item.disabled = true
            return
          } else if (item.children.length > 0){
            this.disableCascadeItem(item.children, id)
          }
        })
      },
      // 监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，修改部门
      editDepartment() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起修改用户的网络请求
          // if (this.editForm.pid.length > 0) {
          //   this.editForm.pid = this.editForm.pid[this.editForm.pid.length-1]
          // } else {
          //   this.editForm.pid = 0
          // }
          const {data: res} = await this.$http.put('department/' + this.editForm.id, this.editForm)
          if (res.status !== 200) {
            this.$message.error('修改部门失败')
          }
          this.$message.success('修改部门成功')
          // 隐藏添加用户的对话框
          this.editDialogVisible = false
          // 重新获取用户数据
          this.getDepartmentList()
        })
      },
      // 根据Id删除对应的部门信息
      async removeDepartmentById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该部门及其下级部门, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('department/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除部门失败')
        }
        this.$message.success('删除部门成功')
        this.getDepartmentList()
      },
      async searchDepartment() {
        this.departmentListByOrganizationId = []
        this.getDepartmentListByOrganizationId(this.searchOrganizationId).then(response => {
          this.departmentList = this.departmentListByOrganizationId
        })
      },
      resetSearch() {
        this.searchOrganizationId = ''
        this.getDepartmentList()
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
