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
      <!--权限列表区域-->
      <el-table ref="table" :data="permissionList" :tree-props="{children: 'children', hasChildren: 'hasChildren'}" row-key="id" @select="selectChange" @select-all="selectAllChange" @selection-change="selectionChangeHandler">
        <el-table-column type="selection" width="55" />
        <el-table-column :show-overflow-tooltip="true" label="菜单名称" width="125px" prop="name" />
        <!--<el-table-column v-if="columns.visible('icon')" prop="icon" label="图标" align="center" width="60px">-->
          <!--<template slot-scope="scope">-->
            <!--<svg-icon :icon-class="scope.row.icon ? scope.row.icon : ''" />-->
          <!--</template>-->
        <!--</el-table-column>-->
        <el-table-column prop="sort" align="center" label="排序">
          <template slot-scope="scope">
            {{ scope.row.sort }}
          </template>
        </el-table-column>
        <!--<el-table-column :show-overflow-tooltip="true" prop="path" label="路由地址" />-->
        <el-table-column :show-overflow-tooltip="true" prop="permission" label="权限标识" />
        <el-table-column :show-overflow-tooltip="true" prop="path" label="组件路径" />
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
        <el-table-column prop="createTime" label="创建日期" width="135px">
          <template slot-scope="scope">
            <span>{{ scope.row.createTime | dateFormat }}</span>
          </template>
        </el-table-column>
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
        permissionList:[]
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
      selectChange() {

      },
      selectAllChange() {

      },
      selectionChangeHandler() {

      }
    }
  }
</script>

<style lang="less" scoped>

</style>
