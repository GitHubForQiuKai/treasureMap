module.exports = {
  title: 'TreasureMap',
  description: 'Just playing around',
  base:'/treasureMap/',
  themeConfig: {
    nav: [
      { text: '前端',link: '/web/' },
      { text: '全栈',link: '/fullStack/' },
      { text: '框架',link: '/frame/' },
      { text: '通识',link: '/common/' },
      { text: '资讯',link: '/info/' },
      { text: '关于',link: '/about/' },
      { text: 'GitHub',link: 'https://github.com/GitHubForQiuKai/treasureMap' },
    ],
    sidebar: {
      '/web/': [{
        title:'前端',
        collapsable: false,
        children: [
          '',
          'html',
          'css',
          'browser',
          'standard'
        ]
      }],
      '/fullStack/': [{
        title:'全栈',
        collapsable: false,
        children: [
          '',
          'mysql',
          ]
      }],
      '/frame/': [{
        title:'框架',
        collapsable: false,
        children: [
          '',
          'vue',
          'postcss',
          'rxjs',
          'typescript',
          'electron',
          'flutter'
          ]
      }],
      '/common/': [{
        title:'通识',
        collapsable: false,
        children: [
          '',
          'nginx',
          'linux',
          'ssh',
          'restful',
          'network',
          'data-structure',
          'algorithm',
          'design-pattern'
          ]
      }]
    }
  }
}