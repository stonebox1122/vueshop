<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>职位列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--添加职位按钮区域-->
      <el-row>
        <el-col>
          <el-button type="primary" @click="showAddDialog()">添加职位</el-button>
        </el-col>
      </el-row>
      <!--职位列表区域-->
      <el-table :data="jobList" stripe :default-sort = "{prop: 'code', order: 'ascending'}">
        <el-table-column label="名称" prop="name" align="center" fixed width="200"></el-table-column>
        <el-table-column label="编码" prop="code" align="center" sortable></el-table-column>
        <el-table-column label="级别" prop="level" align="center"></el-table-column>

        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                       @change="jobStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column label="部门" prop="departmentName" align="center" width="200"></el-table-column>
        <el-table-column label="组织" prop="organizationName" align="center" width="300"></el-table-column>

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

        <el-table-column label="操作" width="190px" align="center" fixed="right">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip effect="dark" content="修改职位" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removeJobById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加职位对话框-->
    <el-dialog
      title="添加职位"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed" :close-on-click-modal='false'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="addForm.name"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="addForm.code"></el-input>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-input v-model="addForm.level"></el-input>
        </el-form-item>
        <el-form-item label="组织" prop="organizationId">
          <el-cascader
            v-model="addForm.organizationId"
            :options="organizationList"
            :props="organizationProps"
            clearable @change="handleChange"></el-cascader>
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-cascader
            v-model="addForm.departmentId"
            :options="departmentListByOrganizationId"
            :props="departmentProps"
            :disabled="optionsChanged"
            :placeholder="departmentPlaceholder"
            clearable></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addJob">确 定</el-button>
      </span>
    </el-dialog>
    <!--修改职位对话框-->
    <el-dialog
      title="修改职位"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed" :close-on-click-modal='false'>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="名称" prop="name">
          <el-input v-model="editForm.name"></el-input>
        </el-form-item>
        <el-form-item label="编码" prop="code">
          <el-input v-model="editForm.code" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="级别" prop="level">
          <el-input v-model="editForm.level"></el-input>
        </el-form-item>
        <el-form-item label="组织" prop="organizationId">
          <el-cascader
            v-model="editForm.organizationId"
            :options="organizationList"
            :props="organizationProps"
            clearable :disabled="true"></el-cascader>
        </el-form-item>
        <el-form-item label="部门" prop="departmentId">
          <el-cascader
            v-model="editForm.departmentId"
            :options="departmentList"
            :props="departmentProps"
            clearable :disabled="true"></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editJob">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Job",
    data() {
      // 验证手机的规则
      var checkLevel = (rule, value, cb) => {
        const regLevel = /^([1-9]|1[0-9])$/
        if (regLevel.test(value)) {
          return cb()
        }
        cb(new Error('职位级别为1-19'))
      }
      // 验证编码唯一性规则
      var checkUnique = (rule, value, cb) => {
        this.existsCode = false
        this.validateCode(this.jobList,value)
        if (this.existsCode === false) {
          return cb()
        }
        cb(new Error('请输入不重复的部门编码'))
      }
      return {
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
        // 所有职位列表数据
        jobList: [],
        departmentListByOrganizationId: [],
        optionsChanged: false,
        departmentPlaceholder: '请选择',
        // 控制添加职位对话框的显示与隐藏
        addDialogVisible: false,
        addForm: {
          name: '',
          code: '',
          level: '',
          departmentId: '',
          organizationId: ''
        },
        // 添加职位表单的验证规则对象
        addFormRules: {
          name: [
            {required: true, message: '请输入职位名称', trigger: 'blur'},
            {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入职位编码', trigger: 'blur'},
            {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'},
            {validator: checkUnique, trigger: ['blur', 'change']}
          ],
          level: [
            {required: true, message: '请输入职位级别', trigger: 'blur'},
            {validator: checkLevel, trigger: ['blur', 'change']},
            {validator: checkUnique, trigger: ['blur', 'change']}
          ],
          departmentId: [
            {required: true, message: '请选择所属部门', trigger: 'blur'}
          ],
          organizationId: [
            {required: true, message: '请选择所属组织', trigger: 'blur'}
          ]
        },
        existsCode: false,
        // 控制修改职位对话框的显示与隐藏
        editDialogVisible: false,
        editForm: {
          name: '',
          code: '',
          level: '',
          departmentId: '',
          organizationId: ''
        },
        // 修改权限表单的验证规则对象
        editFormRules: {
          name: [
            {required: true, message: '请输入职位名称', trigger: 'blur'},
            {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入职位编码', trigger: 'blur'},
            {min: 1, max: 100, message: '长度在 1 到 100 个字符', trigger: 'blur'}
          ],
          level: [
            {required: true, message: '请输入职位级别', trigger: 'blur'},
            {validator: checkLevel, trigger: ['blur', 'change']}
          ]
        }
      }
    },
    created() {
      this.getJobList()
    },
    methods: {
      async getJobList() {
        const {data: res} = await this.$http.get('job')
        if (res.status !== 200) {
          return this.$message.error('获取职位列表失败')
        }
        this.jobList = res.data
      },
      async getDepartmentList() {
        const {data: res} = await this.$http.get('department/tree')
        if (res.status !== 200) {
          return this.$message.error('获取职位架构失败')
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
      // 展示增加职位的对话框
      async showAddDialog() {
        this.getOrganizationList()
        // this.getDepartmentList()
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
      handleChange() {
        this.addForm.departmentId = []
        this.optionsChanged = false
        this.departmentPlaceholder = '请输入'
        if (this.addForm.organizationId.length > 0) {
          const organizationId = this.addForm.organizationId[this.addForm.organizationId.length - 1]
          this.getDepartmentListByOrganizationId(organizationId)
        }
      },
      // 监听添加职位对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加职位
      addJob() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          this.addForm.departmentId = this.addForm.departmentId[this.addForm.departmentId.length-1]
          this.addForm.organizationId = this.addForm.organizationId[this.addForm.organizationId.length-1]
          const {data: res} = await this.$http.post('job', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加职位失败')
          }
          this.$message.success('添加职位成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户数据
          this.getJobList()
        })
      },
      // 监听switch开关状态的改变
      async jobStatusChanged(jobInfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`job/${jobInfo.id}/status/${jobInfo.status}`)
        if (res.status !== 200) {
          jobInfo.status = !jobInfo.status
          return this.$message.error('更新职位状态失败')
        }
        this.$message.success('更新职位状态成功')
        // 重新获取用户数据
        this.getJobList()
      },
      // 获取指定Id的职位
      async getJobItem(id) {
        const {data: res} = await this.$http.get('job/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询职位信息失败')
        }
        this.editForm = res.data
      },
      // 展示编辑职位的对话框
      async showEditDialog(id) {
        this.getJobItem(id)
        this.getOrganizationList()
        this.getDepartmentList()
        // this.$http.all([this.getJobItem(id), this.getJobList()])
        // this.disableCascadeItem(this.jobList, id)
        // console.log(this.jobList)
        this.editDialogVisible = true
      },
      // 递归遍历职位列表，将编辑对话框级联选项中与当前id相同的项禁用
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
      // 点击按钮，修改职位
      editJob() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起修改用户的网络请求
          // if (this.editForm.pid.length > 0) {
          //   this.editForm.pid = this.editForm.pid[this.editForm.pid.length-1]
          // } else {
          //   this.editForm.pid = 0
          // }
          const {data: res} = await this.$http.put('job/' + this.editForm.id, this.editForm)
          if (res.status !== 200) {
            this.$message.error('修改职位失败')
          }
          this.$message.success('修改职位成功')
          // 隐藏添加用户的对话框
          this.editDialogVisible = false
          // 重新获取用户数据
          this.getJobList()
        })
      },
      // 根据Id删除对应的职位信息
      async removeJobById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该职位, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('job/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除职位失败')
        }
        this.$message.success('删除职位成功')
        this.getJobList()
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
