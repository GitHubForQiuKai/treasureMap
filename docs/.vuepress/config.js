module.exports = {
  markdown: {
    lineNumbers: true
  },
  locales: {
    '/': {
      lang: 'zh-CN',
      title: 'TreasureMap',
      description: 'A treasure map of technical knowledge'
    }
  },
  title: 'TreasureMap',
  description: 'Just playing around',
  base: '/treasureMap/',
  themeConfig: {
    repo: 'GitHubForQiuKai/treasureMap',
    lastUpdated: '上次更新',
    sidebarDepth: 3,
    astUpdated: true,
    docsDir: 'docs',
    editLinks: true,
    editLinkText: '帮助我们改善此页面！',
    nav: [
      {
        text: '前端',
        items: [
          { text: 'JS', link: '/web/js/' },
          { text: 'HTML', link: '/web/html/' },
          { text: 'CSS', link: '/web/css/' },
          { text: '浏览器', link: '/web/browser/' },
        ]
      },
      {
        text: '全栈',
        items: [
          { text: 'NodeJS', link: '/fullStack/nodejs/' },
          { text: 'Mysql', link: '/fullStack/mysql/' },
        ]
      },
      {
        text: '框架',
        items: [
          { text: 'Vue', link: '/frame/vue/' },
          { text: 'Webpack', link: '/frame/webpack/' },
          { text: 'Babel', link: '/frame/babel/' },
          { text: 'PostCSS', link: '/frame/postcss/' },
          { text: 'RxJS', link: '/frame/rxjs/' },
          { text: 'TypeScript', link: '/frame/typescript/' },
          { text: 'Flutter', link: '/frame/flutter/' },
          { text: 'Electron', link: '/frame/electron/' },
        ]
      },
      {
        text: '通识',
        items: [
          { text: 'Git', link: '/common/git/' },
          { text: 'Nginx', link: '/common/nginx/' },
          { text: 'SSH', link: '/common/ssh/' },
          { text: 'Linux', link: '/common/linux/' },
          { text: 'Network', link: '/common/network/' },
          { text: 'RESTful', link: '/common/restful/' },
          { text: '数据结构', link: '/common/data-structure/' },
          { text: '算法', link: '/common/algorithm/' },
          { text: '设计模式', link: '/common/design-pattern/' },
        ]
      },
      {
        text: '其他',
        items: [
          { text: '树莓派', link: '/other/树莓派/' },
          { text: '机器学习', link: '/other/机器学习/' },
        ]
      },
      {
        text: '关于',
        link: '/about/'
      },
    ],
    sidebar: {
      //前端
      '/web/js/': [{
        title: 'JS',
        collapsable: false,
        children: [
          '',
          'module',
          'async-programming',
          'RegExp',
          'timer',
          'file',
        ]
      }],
      '/web/html/': [{
        title: 'HTML',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/web/css/': [{
        title: 'CSS',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/web/browser/': [{
        title: '浏览器',
        collapsable: false,
        children: [
          '',
        ]
      }],
      //全栈
      '/fullStack/nodejs/': [{
        title: 'NodeJS',
        collapsable: false,
        children: [
          '',
          'module'
        ]
      }],
      '/fullStack/mysql/': [{
        title: 'Mysql',
        collapsable: false,
        children: [
          '',
          'suoyin'
        ]
      }],
      //框架
      '/frame/vue/': [{
        title: 'Vue',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/webpack/': [{
        title: 'Webpack',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/babel/': [{
        title: 'Babel',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/postcss/': [{
        title: 'Vue',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/rxjs/': [{
        title: 'RxJS',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/typescript/': [{
        title: 'TypeScript',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/electron/': [{
        title: 'Electron',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/frame/flutter/': [{
        title: 'Flutter',
        collapsable: false,
        children: [
          '',
        ]
      }],

      //通识
      '/common/git/': [{
        title: 'Git',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/nginx/': [{
        title: 'Nginx',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/linux/': [{
        title: 'Linux',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/ssh/': [{
        title: 'SSH',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/restful/': [{
        title: 'RESTful',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/network/': [{
        title: 'Network',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/data-structure/': [{
        title: '数据结构',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/algorithm/': [{
        title: '算法',
        collapsable: false,
        children: [
          '',
        ]
      }],
      '/common/design-pattern/': [{
        title: '设计模式',
        collapsable: false,
        children: [
          '',
        ]
      }]
    }
  }
}