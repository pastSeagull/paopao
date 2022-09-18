<template>
    <div>
        <main-nav :title="title" />

        <n-list class="main-content-wrap" bordered>
            <template #footer>
                <div class="pagination-wrap" v-if="totalPage > 0">
                    <n-pagination
                        :page="page"
                        @update:page="updatePage"
                        :page-slot="!store.state.collapsedRight ? 8 : 5"
                        :page-count="totalPage"
                    />
                </div>
            </template>
            <n-list-item>
                <!-- 发布器 -->
                <compose @post-success="onPostSuccess" />
            </n-list-item>

            <div v-if="isLoading" class="skeleton-wrap">
                <post-skeleton :num="pageSize" />
            </div>
            <div v-else>
                <div class="empty-wrap" v-if="state.list.length === 0">
                    <n-empty size="large" description="暂无数据" />
                </div>

                <n-list-item v-for="post in state.list" :key="post.id">
                    <post-item :post="post" />
                </n-list-item>
            </div>
        </n-list>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useStore } from 'vuex';
import { getPosts } from '@/api/post';
import { useAsyncState } from '@vueuse/core'
import { routes, title } from "../utils";

const store = useStore();
const { route, router } = routes()

const page = ref(+(route.query.p as string) || 1);
const pageSize = ref(20);

const { state, isReady, isLoading, execute } = useAsyncState((args) => getPosts(args)
, { list: [], pager: { page: 1, page_size: 20, total_rows: 0} }, { resetOnExecute: false })

const onExecute = () => {
	execute(
		500,
		{
			query: route.query.q ? decodeURIComponent(route.query.q as string) : null,
			type: route.query.t as string,
			page: page.value,
			page_size: pageSize.value,
		}
	)
}
onExecute()

const totalPage = computed(() => {
	return Math.ceil(state.value?.pager?.total_rows / pageSize.value);
})

// 后面在改
const onPostSuccess = (post: Item.PostProps) => {
    // 如果不在第一页，需要跳转到详情页面
    if (page.value != 1) {
        router.push({
            name: 'post',
            query: {
                id: post.id,
            },
        });
        return;
    }

    // 如果实在第一页，就地插入新推文到文章列表中
    let items = [];
    let length = state.value.list.length;
    if (length == pageSize.value) {
        length--;
    }
    var i = 0;
    for (;i < length; i++) {
        let item: Item.PostProps = state.value.list[i];
        if (!item.is_top) {
            break;
        }
        items.push(item);
    }
    items.push(post);
    for (;i < length; i++) {
        items.push(state.value.list[i]);
    }
    state.value.list = items;
};

const updatePage = (p: number) => {
    router.push({
        name: 'home',
        query: {
            ...route.query,
            p,
        },
    });
};

watch(
    () => ({
        path: route.path,
        query: route.query,
        refresh: store.state.refresh,
    }),
    (to, from) => {
		console.log("watch", to, from)
        if (to.refresh !== from.refresh) {
            page.value = +(route.query.p as string) || 1;
            setTimeout(() => {
	            onExecute()
            }, 0);
            return;
        }
        if (from.path !== '/post' && to.path === '/') {
            page.value = +(route.query.p as string) || 1;

            setTimeout(() => {
	            onExecute()
            }, 0);
        }
    }
);
</script>

<style lang="less" scoped>
.pagination-wrap {
    padding: 10px;
    display: flex;
    justify-content: center;
    overflow: hidden;
}
</style>
