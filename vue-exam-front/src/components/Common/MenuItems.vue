// 在菜单数组中添加专属试卷管理的菜单项 // 通常放在HR专区下，仅对面试官角色显示 //
找到HR菜单分组，或者找到合适的位置添加新菜单项 { title: '专属试卷管理', path: '/private-exams',
icon: 'el-icon-document', roles: ['INTERVIEWER'] // 只对面试官显示 },
