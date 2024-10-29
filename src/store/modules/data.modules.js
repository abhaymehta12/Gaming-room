import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

export default {
    namespaced: true,
    state: {
        groups: [],
    },
    getters: {
    },
    actions: {
        async getGroups({ commit }) {
            try {
                const data = await firebase.firestore().collection("groups").get()
                data.docs.forEach((doc) => {
                    commit("set_group", doc.data())
                })
            } catch (error) {
                console.log(error);
            }
        }
    },
    mutations: {
        set_group: (state, data) => {
            state.groups = data;
        }
    }
}