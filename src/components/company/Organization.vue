<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>公司管理</el-breadcrumb-item>
      <el-breadcrumb-item>组织列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>
      <!--添加组织按钮-->
      <el-row :gutter="5">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加组织</el-button>
        </el-col>
      </el-row>

      <!--组织列表区域-->
      <el-table ref="table" :data="organizationList" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" style="width: 100%;margin-bottom: 20px;" default-expand-all>
        <el-table-column :show-overflow-tooltip="true" label="组织名称" prop="name" fixed width="200"/>
        <el-table-column :show-overflow-tooltip="true" label="组织编码" prop="code" align="center" width="200"/>
        <el-table-column :show-overflow-tooltip="true" label="法人代表" prop="legalRepresentative" align="center"/>

        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                       @change="organizationStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>

        <el-table-column :show-overflow-tooltip="true" label="电话" prop="phone" align="center" width="100"/>
        <el-table-column :show-overflow-tooltip="true" label="邮箱" prop="mail" align="center" width="200"/>
        <el-table-column :show-overflow-tooltip="true" label="地址" prop="address" align="center" width="300"/>

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
                         @click="removeOrganizationById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!--添加组织对话框-->
    <el-dialog
      title="添加组织"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed" :close-on-click-modal='false'>
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="addForm.name"/>
        </el-form-item>
        <el-form-item label="组织编码" prop="code">
          <el-input v-model="addForm.code"/>
        </el-form-item>
        <el-form-item label="上级组织" prop="pid">
          <el-cascader
            v-model="addForm.pid"
            :options="organizationList"
            :props="cascaderProps"
            style="width:544px;"
            clearable></el-cascader>
        </el-form-item>
        <el-form-item label="法人代表" prop="legalRepresentative">
          <el-input v-model="addForm.legalRepresentative"/>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="addForm.phone"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="mail">
          <el-input v-model="addForm.mail"/>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="addForm.address"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addOrganization">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改组织对话框-->
    <el-dialog
      title="修改组织"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed" :close-on-click-modal='false'>
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="组织名称" prop="name">
          <el-input v-model="editForm.name"/>
        </el-form-item>
        <el-form-item label="组织编码" prop="code">
          <el-input v-model="editForm.code" :disabled="true"/>
        </el-form-item>
        <el-form-item label="上级组织" prop="pid">
          <el-cascader
            v-model="editForm.pid"
            :options="organizationList"
            :props="cascaderProps"
            style="width:544px;"
            clearable :disabled="true"></el-cascader>
        </el-form-item>
        <el-form-item label="法人代表" prop="legalRepresentative">
          <el-input v-model="editForm.legalRepresentative"/>
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone"/>
        </el-form-item>
        <el-form-item label="邮箱" prop="mail">
          <el-input v-model="editForm.mail"/>
        </el-form-item>
        <el-form-item label="地址" prop="address">
          <el-input v-model="editForm.address"/>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editOrganization">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Organization",
    data() {
      // 验证编码唯一性规则
      var checkUnique = (rule, value, cb) => {
        this.existsCode = false
        this.validateCode(this.organizationList,value)
        if (this.existsCode === false) {
          return cb()
        }
        cb(new Error('请输入不重复的组织编码'))
      }
      return {
        organizationList: [],
        // 指定级联选择器的配置对象
        cascaderProps: {
          value: 'id',
          label: 'name',
          children: 'children',
          expandTrigger: "hover",
          checkStrictly: true
        },
        // 控制添加组织对话框的显示与隐藏
        addDialogVisible: false,
        // 添加组织的表单数据
        addForm: {
          name: '',
          code: '',
          pid: '',
          legalRepresentative: '',
          phone: '',
          mail: '',
          address: ''
        },
        // 添加表单的验证规则对象
        addFormRules: {
          name: [
            {required: true, message: '请输入组织名称', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          code: [
            {required: true, message: '请输入组织编码', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'},
            {validator: checkUnique, trigger: ['blur', 'change']}
          ],
          legalRepresentative: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          phone: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          mail: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          address: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ]
        },
        existsCode: false,
        // 控制修改组织对话框的显示与隐藏
        editDialogVisible: false,
        // 修改组织的表单信息
        editForm: {
          id: '',
          name: '',
          code: '',
          pid: '',
          legalRepresentative: '',
          phone: '',
          mail: '',
          address: ''
        },
        editFormRules: {
          name: [
            {required: true, message: '请输入组织名称', trigger: 'blur'},
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          legalRepresentative: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          phone: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          mail: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ],
          address: [
            {min: 1, max: 200, message: '长度在 1 到 200 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getOrganizationList()
    },
    methods: {
      async getOrganizationList() {
        const {data: res} = await this.$http.get('organization/tree')
        if (res.status !== 200) {
          return this.$message.error('获取组织架构失败')
        }
        this.organizationList = res.data
        this.removeChildren(this.organizationList)
        // console.log(this.organizationList)
        this.menuList = []
        for (let item1 of res.data) {
          for (let item2 of item1.children) {
            let obj = {name: '', id: ''}
            let name = item1.name + '/' + item2.name
            let id = item2.id
            obj.name = name;
            obj.id = id;
            this.menuList.push(obj)
            //console.log(this.menuList)
          }
        }
        //console.log(this.menuList)
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
      // 展示增加组织的对话框
      async showAddDialog() {
        this.addDialogVisible = true
      },
      // 监听添加组织对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加组织
      addOrganization() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          if (this.addForm.pid === '') {
            this.addForm.pid = 0
          }  else {
            this.addForm.pid = this.addForm.pid[this.addForm.pid.length-1]
          }
          const {data: res} = await this.$http.post('organization', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加组织失败')
          }
          this.$message.success('添加组织成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户数据
          this.getOrganizationList()
        })
      },
      // 监听switch开关状态的改变
      async organizationStatusChanged(organizationInfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`organization/${organizationInfo.id}/status/${organizationInfo.status}`)
        if (res.status !== 200) {
          organizationInfo.status = !organizationInfo.status
          return this.$message.error('更新组织状态失败')
        }
        this.$message.success('更新组织状态成功')
        // 重新获取用户数据
        this.getOrganizationList()
      },
      // 获取指定Id的组织
      async getOrganizationItem(id) {
        const {data: res} = await this.$http.get('organization/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询组织信息失败')
        }
        this.editForm = res.data
      },
      // 展示编辑组织的对话框
      async showEditDialog(id) {
        this.getOrganizationItem(id)
        // this.$http.all([this.getOrganizationItem(id), this.getOrganizationList()])
        // this.disableCascadeItem(this.organizationList, id)
        // console.log(this.organizationList)
        this.editDialogVisible = true
      },
      // 递归遍历组织列表，将编辑对话框级联选项中与当前id相同的项禁用
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
      // 点击按钮，修改组织
      editOrganization() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起修改用户的网络请求
          // if (this.editForm.pid.length > 0) {
          //   this.editForm.pid = this.editForm.pid[this.editForm.pid.length-1]
          // } else {
          //   this.editForm.pid = 0
          // }
          const {data: res} = await this.$http.put('organization/' + this.editForm.id, this.editForm)
          if (res.status !== 200) {
            this.$message.error('修改组织失败')
          }
          this.$message.success('修改组织成功')
          // 隐藏添加用户的对话框
          this.editDialogVisible = false
          // 重新获取用户数据
          this.getOrganizationList()
        })
      },
      // 根据Id删除对应的组织信息
      async removeOrganizationById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该组织及其下级组织, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('organization/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除组织失败')
        }
        this.$message.success('删除组织成功')
        this.getOrganizationList()
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
