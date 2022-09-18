<template>
    <div>
        <main-nav title="话题" />

        <n-list class="main-content-wrap tags-wrap" bordered>
            <n-tabs type="line" animated @update:value="changeTab">
                <n-tab-pane name="hot" tab="热门" />
                <n-tab-pane name="new" tab="最新" />
            </n-tabs>
            <n-spin :show="isLoading">
                <n-space>
                    <n-tag class="tag-item" type="success" round v-for="tag in state" :key="tag.id">
                        <router-link class="hash-link" :to="{
                            name: 'home',
                            query: {
                                q: tag.tag,
                                t: 'tag',
                            },
                        }">
                            #{{ tag.tag }}
                        </router-link>
                        <span class="tag-hot">({{ tag.quote_num }})</span>
                        <template #avatar>
                            <n-avatar :src="tag.user.avatar" />
                        </template>
                    </n-tag>
                </n-space>
            </n-spin>
        </n-list>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { getTags } from '@/api/post';
import { useAsyncState } from '@vueuse/core'
const tagType = ref<"hot" | "new">('hot');

const { isLoading, state, execute } = useAsyncState(
    (args) => getTags(args),
    [],
    {
        delay: 500,
        resetOnExecute: false
    }
)
const onExecute = () => {
    execute(
        500,
        {
            type: tagType.value,
            num: 50,
        }
    )
}
onExecute()

const changeTab = (tab: "hot" | "new") => {
    tagType.value = tab;
    onExecute()
};
</script>

<style lang="less" scoped>
.tags-wrap {
    padding: 20px;

    .tag-item {
        .tag-hot {
            margin-left: 12px;
            font-size: 12px;
            opacity: 0.75;
        }
    }
}
</style>
