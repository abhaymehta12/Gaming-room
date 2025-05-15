import firebase from 'firebase/compat/app'
import 'firebase/compat/firestore'

export default {
    namespaced: true,
    state: {
        playerInfo: null,
        group: null,
        gameStarted: false
    },
    getters: {
    },
    actions: {
        async getGroupInfo({ commit, state }) {
            try {
                const data = await firebase.firestore().collection("groups").doc(state.group.id).get();
                commit("set_group", data.data());
                commit("game_status", true);
            } catch (error) {
                console.log(error);
            }
        },
        async setGroups({ commit }, id) {
            try {
                const data = await firebase.firestore().collection("members").where('status', '==', 'waiting').get();
                let totalMembers = []
                if (!data.empty) {
                    data.docs.forEach((doc) => {
                        totalMembers.push(doc.data());
                    })
                }
                if (totalMembers.length > 3) {
                    while (totalMembers.length > 0) {
                        let grouping = totalMembers.splice(0, 4)
                        if (grouping.length > 3) {
                            let obj = { members: grouping, memberCount: grouping.length, gameStatus: 'ready', shuffler: grouping[0].id }
                            const resp = await firebase.firestore().collection("groups").add(obj);
                            await firebase.firestore().collection("groups").doc(resp.id).set({ id: resp.id }, { merge: true });
                            let res = grouping.findIndex(x => x.id === id);
                            obj.id = resp.id
                            if (res >= 0) {
                                commit("set_group", obj);
                            }
                        } else {
                            setBots(grouping);
                        }
                    }
                } else {
                    setBots(totalMembers);
                }
            } catch (error) {
                console.log(error);
            }
            async function setBots(param) {
                const actualMemberCount = param.length;
                const names = ["abhay", "chotu", "shivam", "latika", "akash", "pallavi", "thor", "mak", "bitzz", "gabbar"];
                for (let i = param.length; i < 4; i++) {
                    param[i] = {
                        name: names[Math.floor(Math.random() * names.length)],
                        id: Math.floor(Math.random() * 1001)
                    }
                }
                let admin
                param.forEach(el => {
                    if (el.name != 'test1' && el.status) {
                        admin = el.id;
                    }
                })
                let obj = { members: param, memberCount: actualMemberCount, gameStatus: 'ready', shuffler: admin }
                const resp = await firebase.firestore().collection("groups").add(obj);
                await firebase.firestore().collection("groups").doc(resp.id).set({ id: resp.id }, { merge: true });
                let res = param.findIndex(x => x.id === id);
                obj.id = resp.id;
                if (res >= 0) {
                    commit("set_group", obj);
                }
            }
        },
        async addMember({ commit, dispatch }, payload) {
            try {
                const query = await firebase.firestore().collection('members').where('name', '==', payload.name).where('status', '!=', 'delete').get();
                if (!query.empty) {
                    return "Name Already Exist";
                } else {
                    const resp = await firebase.firestore().collection("members").add({ name: payload.name, status: 'waiting' });
                    await firebase.firestore().collection("members").doc(resp.id).set({ id: resp.id }, { merge: true });
                    commit("set_playerInfo", { name: payload.name, status: 'waiting', id: resp.id });
                    if (payload.type === 'lounge') {
                        console.group("Create Lounge");
                    } else {
                        dispatch('setGroups', resp.id);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
        deleteMember({ commit, state }, payload) {
            try {
                let updatedGrp = state.group;
                const groupMembers = state.group.members.filter(item => item.id !== payload);
                let flagBots = true;
                let members = 0;
                groupMembers.forEach(ele => {
                    if (ele.status) {
                        flagBots = false;
                        if (payload === state.group.shuffler) {
                            updatedGrp.shuffler = ele.id;
                        }
                        members++;
                    }
                })
                if (flagBots) {
                    firebase.firestore().collection("groups").doc(state.group.id).delete();
                } else {
                    const names = ["abhay", "chotu", "shivam", "latika", "akash", "pallavi", "thor", "mak", "bitzz", "gabbar"];
                    let obj = {
                        name: names[Math.floor(Math.random() * names.length)],
                        id: Math.floor(Math.random() * 1001)
                    }
                    groupMembers.push(obj);
                    updatedGrp.members = groupMembers;
                    updatedGrp.memberCount = members;
                    firebase.firestore().collection("groups").doc(state.group.id).set(updatedGrp, { merge: true });
                }
                firebase.firestore().collection("members").doc(payload).set({ status: "delete" }, { merge: true });
                commit("clear_state");
            } catch (error) {
                console.log(error);
            }
        },
        async setRoles({ commit, state }) {
            let roles = []
            try {
                let obj = state.group;
                const groupMembers = state.group.members;
                if (state.group.gameStatus === "round2") {
                    groupMembers.forEach(el => {
                        if (el.role && el.role !== "over") {
                            roles.push(el.role);
                        }
                    })
                } else {
                    roles = ["Raja", "Mantri", "Chor", "Sipahi"];
                    obj.gameStatus = "progress";
                }
                const shuffled = roles.sort(() => 0.5 - Math.random());
                groupMembers.forEach((obj, index) => {
                    if ((obj.role && obj.role !== "over") || !obj.role) {
                        obj.role = shuffled[index];
                    }
                    if (obj.status && obj.status !== "inGame") {
                        firebase.firestore().collection("members").doc(obj.id).set({ status: "inGame" }, { merge: true });
                    }
                    if (obj.id === state.playerInfo.id) {
                        state.playerInfo.role = obj.role;
                    }
                });
                obj.members = groupMembers;
                await firebase.firestore().collection("groups").doc(state.group.id).set(obj, { merge: true });
                commit("set_group", obj);
            } catch (error) {
                console.log(error);
            }
        },
        async setResults({ commit, state }, payload) {
            try {
                let obj = {
                    chorKilled: payload.id,
                    gameStatus: "round2"
                }
                if (state.group.gameStatus === 'round2') {
                    obj.gameStatus = "over";
                }
                await firebase.firestore().collection("groups").doc(state.group.id).set(obj, { merge: true });
            } catch (error) {
                console.log(error);
            }
        },
        async gameRoundsOver({ commit, state }, payload) {
            try {
                let obj = {
                    Killed: payload.role,
                    gameStatus: "over"
                }
                await firebase.firestore().collection("groups").doc(state.group.id).set(obj, { merge: true });
            } catch (error) {
                console.log(error);
            }
        },
        async getResults({ commit, state }) {
            try {
                const data = await firebase.firestore().collection("groups").doc(state.group.id).get();
                if (data.data().Killed) {
                    return `${data.data().Killed} is dead, Game Over.`;
                } else if (data.data().chorKilled && data.data().chorKilled === state.playerInfo.id) {
                    const groupMembers = state.group.members;
                    groupMembers.forEach(ele => {
                        if (data.data().chorKilled === ele.id) {
                            ele.role = "over";
                        }
                    })
                    let obj = {
                        members: groupMembers
                    }
                    firebase.firestore().collection("groups").doc(state.group.id).set(obj, { merge: true });
                    return `${state.playerInfo.role} is Killed by the soldier.`;
                } else {
                    return "Good Luck, Try Again.";
                }
            } catch (error) {
                console.log(error);
            }
        },
        async restartGame({ commit, dispatch, state }) {
            try {
                commit("game_status", false);
                const data = await firebase.firestore().collection("groups").doc(state.group.id).get();
                const hasBots = state.group.members.some(obj => !('status' in obj));
                let currentGameStatus = data.data().gameStatus;
                if ((currentGameStatus === "over" && !hasBots) || currentGameStatus === "round2") {
                    const groupMembers = data.data().members;
                    let rounds = groupMembers.filter(item => item.role === 'over');
                    if (currentGameStatus === "over" || rounds.length === 2) {
                        groupMembers.forEach(el => {
                            delete el.role;
                        })
                        currentGameStatus = "ready";
                    }
                    await firebase.firestore().collection("groups").doc(state.group.id).set({ gameStatus: currentGameStatus, members: groupMembers }, { merge: true });
                    commit("set_group", { ...state.group, gameStatus: currentGameStatus, members: groupMembers });
                } else {
                    data.data().members.forEach(obj => {
                        if (obj.status) {
                            firebase.firestore().collection("members").doc(obj.id).set({ status: "waiting" }, { merge: true });
                        }
                    });
                    dispatch('setGroups', state.playerInfo.id);
                }
            } catch (error) {
                console.log(error);
            }
        }
    },
    mutations: {
        set_group: (state, data) => {
            state.group = data;
        },
        set_playerInfo: (state, data) => {
            state.playerInfo = data;
        },
        game_status: (state, data) => {
            state.gameStarted = data;
        },
        clear_state: (state) => {
            state.playerInfo = null;
            state.group = null;
            state.gameStarted = false;
        },
    }
}