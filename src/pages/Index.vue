<template>
<div class="game">
  <ul class="roles-list" id="roles" :class="{trans: isTrans}" :style="{height: `${totalHeight}px`}">
    <li v-for="(item, index) in renderList" :key="index" :class="[`roles-${item.role}`]" :data-index="index" :style="{ width: `${item.width}px`, height: `${item.height}px`, left: `${item.left}px`, top: `${item.top}px`}">
      {{item.name}}
    </li>
  </ul>
</div>
</template>
<script>
import Huarongdao from '../utils/Huarongdao'

export default {
  data() {
    return {
      roles: [{
          role: 1, // 类型，1: 关羽,2: 卒,3: 张飞,4: 曹操,5: 赵云,6: 马超,7: 黄忠
          name: '关羽', // 类型名称
          hSize: 2, // 横向占用空间大小
          vSize: 1 // 纵向占用空间大小 // 空间排列方向 1：横向，2：纵向
        },
        {
          role: 2,
          name: '卒',
          hSize: 1,
          vSize: 1
        },
        {
          role: 3,
          name: '张飞',
          hSize: 1,
          vSize: 2
        },
        {
          role: 4,
          name: '曹操',
          hSize: 2,
          vSize: 2
        },
        {
          role: 5,
          name: '赵云',
          hSize: 1,
          vSize: 2
        },
        {
          role: 6,
          name: '马超',
          hSize: 1,
          vSize: 2
        },
        {
          role: 7,
          name: '黄忠',
          hSize: 1,
          vSize: 2
        }
      ],
      layout: [ // 类型 1: 关羽,2: 卒,3: 张飞,4: 曹操,5: 赵云,6: 马超,7: 黄忠
        {
          role: 3,
          x: 0,
          y: 0
        },
        {
          role: 4,
          x: 1,
          y: 0
        },
        {
          role: 5,
          x: 3,
          y: 0
        },

        {
          role: 6,
          x: 0,
          y: 2
        },
        {
          role: 1,
          x: 1,
          y: 2
        },
        {
          role: 7,
          x: 3,
          y: 2
        },

        {
          role: 2,
          x: 1,
          y: 3
        },
        {
          role: 2,
          x: 2,
          y: 3
        },

        {
          role: 2,
          x: 0,
          y: 4
        },
        {
          role: 2,
          x: 3,
          y: 4
        }
      ],
      renderList: [], // 渲染列表
      spaceScale: 0.02, // 间隙角色间比例
      totalHeight: 0, // 总高度
      huarongdao: null, // Huarongdao实例
      isTrans: false // 滑动停止时启用css3动画
    }
  },
  mounted() {
    let {
      roles,
      layout,
      spaceScale
    } = this
    this.$nextTick(() => {
      // Huarongdao实例
      let ele = document.querySelector('#roles')
      let huarongdao = new Huarongdao({
        ele,
        roles,
        layout,
        datasetKey: 'index',
        hSize: 4,
        vSize: 5,
        spaceScale
      })
      // 事件注册
      huarongdao.startEvent = (e)=>{
        this.isTrans = false
      }
      huarongdao.moveEvent = (e)=>{
        let {
          moveIndex,
          singleWidth,
          spaceWidth,
        } = huarongdao
        if(moveIndex !== -1){
          let {left, top, role} = renderList[moveIndex]
          let x = Math.round(left / (singleWidth + spaceWidth))
          let y = Math.round(top / (singleWidth + spaceWidth))
          if(role === 4 && x === 1 && y === 3){
            alert('you win!')
          }
        }
        
      }
      huarongdao.update = ()=>{
        this.setLayout()
      }
      huarongdao.beforeEnd = ()=>{
        this.isTrans = true
      }
      huarongdao.endEvent = ()=>{
        this.setLayout()
      }

      let {totalHeight, renderList} = huarongdao
      this.totalHeight = totalHeight
      this.huarongdao = huarongdao
      this.setLayout()
    })

  },
  methods: {
    setLayout(){
      let {
        huarongdao
      } = this
      let {
        renderList
      } = huarongdao
      this.renderList = renderList
    }
  }
}
</script>
<style scoped>
body,
ul,
li,
p {
  margin: 0;
  padding: 0;
}

ul {
  list-style: none;
}

.game {
  text-align: center;
  width:100%;
  height:600px;
  overflow: hidden;
}

.roles-list {
  position: relative;
  width: 100%;
  background: #ccc;

  li {
    position: absolute;
    left: 0;
    top: 0;
    z-index: 6;
    color: #fff;
    border-radius: .1rem;

    /* 1: 关羽,2: 卒,3: 张飞,4: 曹操,5: 赵云,6: 马超,7: 黄忠 */
    &.roles-0 {
      box-shadow: 0 0 .05rem #ccc;
      z-index: 3;
    }

    &.roles-1 {
      background: green;
    }

    &.roles-2 {
      background: red;
    }

    &.roles-3 {
      background: yellow;
    }

    &.roles-4 {
      background: blue;
    }

    &.roles-5 {
      background: gray;
    }

    &.roles-6 {
      background: #996633;
    }

    &.roles-7 {
      background: #660099;
    }

  }
}

.trans {
  li {
    transition: all .1s ease;
  }
}
</style>
