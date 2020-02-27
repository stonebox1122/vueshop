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

      <!--添加权限对话框-->
      <el-dialog
        title="添加权限"
        :visible.sync="addDialogVisible"
        width="50%" @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
          <el-form-item label="权限类型" prop="type">
            <el-radio-group v-model="addForm.type" style="width: 250px">
              <el-radio-button label="0">目录</el-radio-button>
              <el-radio-button label="1">菜单</el-radio-button>
              <el-radio-button label="2">按钮</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="名称" prop="name">
            <el-input v-model="addForm.name"/>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
      </el-dialog>

      <!--权限列表区域-->
      <el-table ref="table" :data="permissionList" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" style="width: 100%;margin-bottom: 20px;">
        <!--<el-table-column type="selection" width="55" />-->
        <el-table-column :show-overflow-tooltip="true" label="名称" width="125px" prop="name" />
        <!--<el-table-column v-if="columns.visible('icon')" prop="icon" label="图标" align="center" width="60px">-->
          <!--<template slot-scope="scope">-->
            <!--<svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column :show-overflow-tooltip="true" prop="type" label="类型" align="center">
          <template slot-scope="scope">
            <el-tag v-if="scope.row.type==='0'">目录</el-tag>
            <el-tag type="success" v-else-if="scope.row.type==='1'">菜单</el-tag>
            <el-tag type="warning" v-else>按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限"/>
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
                       @change="userStatusChanged(scope.row)"></el-switch>
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
  </div>
</template>

<script>
  export default {
    name: "Permission",
    data() {
      return {
        permissionList:[],
        // 控制添加权限对话框的显示与隐藏
        addDialogVisible: false,
        // 添加用户的表单数据
        addForm: {
          username: '',
          password: '',
          roleId: '',
          type: 0
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
          ]
        }
      }
    },
    created() {
      this.getPermissionList()
    },
    methods: {
      async getPermissionList() {
        const {data:res} = await this.$http.get('permission/tree')
        if (res.status !== 200) {
          return this.$message.error('获取权限列表失败')
        }
        this.permissionList = res.data
        // console.log(this.rightsList)
      },
      // 展示增加权限的对话框
      async showAddDialog() {
        this.addDialogVisible = true
      }
    }
  }
</script>

<style lang="less" scoped>

</style>
