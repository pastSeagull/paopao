import { useRoute, useRouter } from "vue-router";
import { computed } from 'vue'

export const routes = () => {
    const route = useRoute();
    const router = useRouter();
    return {
        route,
        router
    }
}

export const title = computed(() => {
    let t = '泡泡广场';
    const { route } = routes()
    if (route.query && route.query.q) {
        if (route.query.t && route.query.t === 'tag') {
            t = '#' + decodeURIComponent(route.query.q as string);
        } else {
            t = '搜索: ' + decodeURIComponent(route.query.q as string);
        }
    }
    return t;
});
