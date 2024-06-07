import { Context, Dict, Model, Schema } from 'koishi'

import * as groupmanager from './groupmanage'
import zh from './locales/zh-CN.yml'


export const name = 'minecraft-dreamcloud'
export const inject = ['database']

declare module 'koishi' {
  interface Context {
    model: Model
    plugin: any
  }
}

// 配置文件
export interface GroupConfig {
  list?: string[]
  autoJoin?: boolean
  isWelcome?: boolean
  welcome?: string
}

export interface CustomConfig {
  command?: string
  mode?: 'search' | 'cmd'
  excute?: string[]
  contect?: string
}

export interface Config {
  group: GroupConfig
  forceBind: boolean
  maxBind: number
  lockName: boolean
  custom: CustomConfig[]
}

export const GroupConfig: Schema<Config> = Schema.intersect([
  Schema.object({
    list: Schema.array(String).role('table'),
    autoJoin: Schema.boolean().default(false),
    isWelcome: Schema.boolean().default(true),
  }),
  Schema.union([
    Schema.object({
      isWelcome: Schema.const(true),
      welcome: Schema.string().role('textarea', { rows: [2, 6] }).default('欢迎来到次梦幻境\r服务器IP: base.mcloli.cn'),
    }),
    Schema.object({})
  ])
]);

export const CustomConfig: Schema<Config> = Schema.array(
  Schema.intersect([Schema.object({
    command: Schema.string(),
    mode: Schema.union([
        Schema.const('search'),
        Schema.const('cmd')
      ]).required()
      .role('checkbox'),
  }),
  Schema.union([
    Schema.object({
      mode: Schema.const('cmd').required(),
      excute: Schema.array(String).role('table'),
    })
  ]),
  Schema.object({
    contect: Schema.string().role('textarea',{rows:[2,6]})
  })
]))

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    group: GroupConfig,
  }),
  Schema.object({
    forceBind: Schema.boolean().default(true),
    maxBind: Schema.number().default(1),
  }),
  Schema.object({
    lockName: Schema.boolean().default(false),
  }),
  Schema.object({
    custom: CustomConfig,
  })
]).i18n({
  'zh-CN': require('./locales/zh-CN')
})

export function apply(ctx: Context,config: Config) {
  ctx.i18n.define('zh-CN',zh)
  

  ctx.intersect(session=>config.group.list.includes(session.guildId))
  .platform('onebot').plugin(groupmanager,config)
}

