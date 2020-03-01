<template>
  <div>
    <!--面包屑导航区域-->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!--卡片视图区域-->
    <el-card>

      <el-row :gutter="5">
        <el-col :span="4">
          <el-button type="primary" @click="showAddDialog()">添加权限</el-button>
        </el-col>
      </el-row>

      <!--权限列表区域-->
      <el-table ref="table" :data="permissionList" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" style="width: 100%;margin-bottom: 20px;">
        <!--<el-table-column type="selection" width="55" />-->
        <el-table-column :show-overflow-tooltip="true" label="名称" width="125px" prop="name" />
        <el-table-column :show-overflow-tooltip="true" label="图标" prop="css"  align="center">
          <template slot-scope="scope">
            <i :class="scope.row.css"></i>
          </template>
        </el-table-column>
        <!--<el-table-column v-if="columns.visible('icon')" prop="icon" label="图标" align="center" width="60px">-->
          <!--<template slot-scope="scope">-->
            <!--<svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column :show-overflow-tooltip="true" label="类型" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type === 0">目录</el-tag>
            <el-tag type="success" v-else-if="scope.row.type === 1">菜单</el-tag>
            <el-tag type="warning" v-else>按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="permission" label="描述"/>
        <el-table-column :show-overflow-tooltip="true" prop="path" label="路径"/>
        <!--<el-table-column prop="sort" label="排序" align="center">-->
          <!--<template slot-scope="scope">-->
            <!--{{ scope.row.sort }}-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column :show-overflow-tooltip="true" prop="path" label="路由地址" />-->
        <el-table-column label="状态" align="center">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.status" :active-value="1" :inactive-value="0"
                       @change="permissionStatusChanged(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120px" align="center">
          <template slot-scope="scope">
            <!--修改按钮-->
            <el-tooltip effect="dark" content="修改" placement="top-start" :enterable="false">
              <el-button type="primary" icon="el-icon-edit" size="mini"
                         @click="showEditDialog(scope.row.id)"></el-button>
            </el-tooltip>
            <!--删除按钮-->
            <el-tooltip effect="dark" content="删除" placement="top-start" :enterable="false">
              <el-button type="danger" icon="el-icon-delete" size="mini"
                         @click="removePermissionById(scope.row.id)"></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
        <!--<el-table-column prop="iframe" label="外链" width="75px">-->
          <!--<template slot-scope="scope">-->
            <!--<span v-if="scope.row.iframe">是</span>-->
            <!--<span v-else>否</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column v-if="columns.visible('cache')" prop="cache" label="缓存" width="75px">-->
          <!--<template slot-scope="scope">-->
            <!--<span v-if="scope.row.cache">是</span>-->
            <!--<span v-else>否</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column v-if="columns.visible('hidden')" prop="hidden" label="可见" width="75px">-->
          <!--<template slot-scope="scope">-->
            <!--<span v-if="scope.row.hidden">否</span>-->
            <!--<span v-else>是</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column prop="createTime" label="创建日期">-->
          <!--<template slot-scope="scope">-->
            <!--<span>{{ scope.row.createTime | dateFormat }}</span>-->
          <!--</template>-->
        <!--</el-table-column>-->
        <!--<el-table-column v-permission="['admin','menu:edit','menu:del']" label="操作" width="130px" align="center" fixed="right">-->
          <!--<template slot-scope="scope">-->
            <!--<udOperation-->
              <!--:data="scope.row"-->
              <!--:permission="permission"-->
              <!--msg="确定删除吗,如果存在下级节点则一并删除，此操作不能撤销！"-->
            <!--/>-->
          <!--</template>-->
        <!--</el-table-column>-->
      </el-table>
    </el-card>

    <!--添加权限对话框-->
    <el-dialog
      title="添加权限"
      :visible.sync="addDialogVisible"
      width="50%" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules1" ref="addFormRef" label-width="90px">
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="addForm.type" style="width: 250px" @change="radioChange">
            <el-radio-button label="0" @change="radioChange">目录</el-radio-button>
            <el-radio-button label="1" @change="radioChange">菜单</el-radio-button>
            <el-radio-button label="2" @change="radioChange">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="addForm.name"/>
        </el-form-item>
        <el-form-item v-if="addForm.type.toString() !== '2'" label="权限图标" prop="css">
          <el-select v-model="addForm.css" placeholder="请选择">
            <el-option
              v-for="item in iconList"
              :key="item.id"
              :label="item.name"
              :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.type.toString() === '1'"  label="上级权限" prop="parentId">
          <el-select v-model="addForm.parentId" placeholder="请选择">
            <el-option
              v-for="item in permissionList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="addForm.type.toString() === '2'"  label="上级权限" prop="parentId">
          <el-select v-model="addForm.parentId" placeholder="请选择">
            <el-option
              v-for="item in menuList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="addForm.type.toString() !== '0'" label="权限描述" prop="permission">
          <el-input v-model="addForm.permission"/>
        </el-form-item>
        <el-form-item v-show="addForm.type.toString() !== '0'" label="权限路径" prop="path">
          <el-input v-model="addForm.path"/>
        </el-form-item>
        <el-form-item label="权限排序" prop="sort">
          <el-input-number v-model="addForm.sort" :min="1" :max="999" controls-position="right" style="width: 217px;" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addPermission">确 定</el-button>
      </span>
    </el-dialog>

    <!--修改权限对话框-->
    <el-dialog
      title="修改权限"
      :visible.sync="editDialogVisible"
      width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules1" ref="editFormRef" label-width="90px">
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="editForm.type" style="width: 250px" @change="radioChange">
            <el-radio-button label="0" @change="radioChange">目录</el-radio-button>
            <el-radio-button label="1" @change="radioChange">菜单</el-radio-button>
            <el-radio-button label="2" @change="radioChange">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="editForm.name"/>
        </el-form-item>
        <el-form-item v-if="editForm.type.toString() !== '2'" label="权限图标" prop="css">
          <el-select v-model="editForm.css" placeholder="请选择">
            <el-option
              v-for="item in iconList"
              :key="item.id"
              :label="item.name"
              :value="item.name">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.type.toString() === '1'"  label="上级权限" prop="parentId">
          <el-select v-model="editForm.parentId" placeholder="请选择">
            <el-option
              v-for="item in permissionList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="editForm.type.toString() === '2'"  label="上级权限" prop="parentId">
          <el-select v-model="editForm.parentId" placeholder="请选择">
            <el-option
              v-for="item in menuList"
              :key="item.id"
              :label="item.name"
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-show="editForm.type.toString() !== '0'" label="权限描述" prop="permission">
          <el-input v-model="editForm.permission"/>
        </el-form-item>
        <el-form-item v-show="editForm.type.toString() !== '0'" label="权限路径" prop="path">
          <el-input v-model="editForm.path"/>
        </el-form-item>
        <el-form-item label="权限排序" prop="sort">
          <el-input-number v-model="editForm.sort" :min="1" :max="999" controls-position="right" style="width: 217px;" />
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editPermission">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
  export default {
    name: "Permission",
    data() {
      return {
        permissionList: [],
        iconList: [],
        menuList: [],
        // 控制添加权限对话框的显示与隐藏
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          type: 0,
          name: '',
          css: '',
          parentId: '',
          permission: '',
          path: '',
          sort: 999
        },
        // 添加表单的验证规则对象
        // 可以添加多个规则，然后使用计算属性，但是在切换的时候就全部验证了，体验不好
        // 参考https://blog.csdn.net/qq_41862017/article/details/82223713
        addFormRules1: {
          type: [
            {required: true, trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入权限名称', trigger: 'blur'},
            {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
          ]
        },
        addFormRules2: {
          type: [
            {required: true, trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入权限名称', trigger: 'blur'},
            {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
          ],
          parentId: [
            {required: true, message: '请选择权限类型', trigger: 'blur'}
          ],
          permission: [
            {required: true, message: '请输入权限描述', trigger: 'blur'},
            {min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur'}
          ],
          path: [
            {required: true, message: '请输入权限路径', trigger: 'blur'},
            {min: 2, max: 200, message: '长度在 2 到 200 个字符', trigger: 'blur'}
          ]
        },
        // 控制修改权限对话框的显示与隐藏
        editDialogVisible: false,
        // 查询到的权限信息对象
        editForm: {
          type: '',
          name: '',
          css: '',
          parentId: '',
          permission: '',
          path: '',
          sort: ''
        },
        editFormRules1: {
          type: [
            {required: true, trigger: 'blur'}
          ],
          name: [
            {required: true, message: '请输入权限名称', trigger: 'blur'},
            {min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur'}
          ]
        }
      }
    },
    created() {
      this.getPermissionList()
    },
    methods: {
      async getPermissionList() {
        const {data: res} = await this.$http.get('permission/tree')
        if (res.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        this.permissionList = res.data
        //console.log(this.permissionList)
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
      async getIconList() {
        const {data: res} = await this.$http.get('icon')
        if (res.status !== 200) {
          return this.$message.error('获取图标列表失败')
        }
        this.iconList = res.data
      },
      // 展示增加权限的对话框
      async showAddDialog() {
        this.getIconList()
        this.addDialogVisible = true
      },
      radioChange() {
        this.addForm.css = ''
        this.addForm.parentId = ''
      },
      // 监听添加用户对话框的关闭事件
      addDialogClosed() {
        this.$refs.addFormRef.resetFields()
      },
      // 点击按钮，添加权限
      addPermission() {
        this.$refs.addFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起添加用户的网络请求
          if (this.addForm.parentId === '') this.addForm.parentId = 0
          const {data: res} = await this.$http.post('permission', this.addForm)
          if (res.status !== 200) {
            this.$message.error('添加权限失败')
          }
          this.$message.success('添加权限成功')
          // 隐藏添加用户的对话框
          this.addDialogVisible = false
          // 重新获取用户数据
          this.getPermissionList()
        })
      },
      // 监听switch开关状态的改变
      async permissionStatusChanged(permissionInfo) {
        //console.log(userinfo)
        const {data: res} = await this.$http.put(`permission/${permissionInfo.id}/status/${permissionInfo.status}`)
        if (res.status !== 200) {
          permissionInfo.status = !permissionInfo.status
          return this.$message.error('更新权限状态失败')
        }
        this.$message.success('更新权限状态成功')
        // 重新获取用户数据
        this.getPermissionList()
      },
      // 展示编辑权限的对话框
      async showEditDialog(id) {
        const {data: res} = await this.$http.get('permission/' + id)
        if (res.status !== 200) {
          return this.$message.error('查询用户信息失败')
        }
        this.editForm = res.data
        this.getIconList()
        this.editDialogVisible = true
      },
      // 监听修改用户对话框的关闭事件
      editDialogClosed() {
        this.$refs.editFormRef.resetFields()
      },
      // 点击按钮，修改权限
      editPermission() {
        this.$refs.editFormRef.validate(async valid => {
          if (!valid) return
          // 预校验通过，可以发起修改用户的网络请求
          const {data: res} = await this.$http.put('permission/' + this.editForm.id, this.editForm)
          if (res.status !== 200) {
            this.$message.error('修改权限失败')
          }
          this.$message.success('修改权限成功')
          // 隐藏添加用户的对话框
          this.editDialogVisible = false
          // 重新获取用户数据
          this.getPermissionList()
        })
      },
      // 根据Id删除对应的权限信息
      async removePermissionById(id) {
        // 弹框询问用户是否删除数据
        const confirmResult = await this.$confirm('此操作将永久删除该权限及其下级权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
        // 如果用户确认删除，则返回值为字符串confirm
        // 如果用户取消删除，则返回值为字符串cancel
        if (confirmResult !== 'confirm') {
          return this.$message.info('已取消删除')
        }
        const {data: res} = await this.$http.delete('permission/' + id)
        if (res.status !== 200) {
          return this.$message.error('删除用户失败')
        }
        this.$message.success('删除用户成功')
        this.getPermissionList()
      }
    },
    computed: {
      addFormRulesList: function () {
        if (this.addForm.type.toString() === '0') {
          return this.addFormRules1
        } else {
          return this.addFormRules2
        }
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
