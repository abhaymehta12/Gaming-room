import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';

export default {
    namespaced: true,
    state: {
        playerInfo: null,
        group: null,
        gameStarted: false,
        lounge: null
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
        async setGroups({ commit }, payload) {
            try {
                if (payload.memberCount === 4) {
                    const resp = await firebase.firestore().collection("groups").add(payload);
                    firebase.firestore().collection("groups").doc(resp.id).set({ id: resp.id }, { merge: true });
                    payload.id = resp.id;
                    commit("set_group", payload);
                } else {
                    setBots(payload);
                }
            } catch (error) {
                console.log(error);
            }
            async function setBots(param) {
                const actualMemberCount = param.members.length;
                const names = ["abhay", "chotu", "shivam", "latika", "akash", "pallavi", "thor", "mak", "bitzz", "gabbar"];
                for (let i = actualMemberCount; i < 4; i++) {
                    param.members[i] = {
                        name: names[Math.floor(Math.random() * names.length)],
                        id: Math.floor(Math.random() * 1001)
                    }
                }
                const resp = await firebase.firestore().collection("groups").add(param);
                await firebase.firestore().collection("groups").doc(resp.id).set({ id: resp.id }, { merge: true });
                param.id = resp.id;
                commit("set_group", param);
            }
        },
        async addMember({ commit, dispatch }, payload) {
            try {
                const query = await firebase.firestore().collection('members').where('name', '==', payload.name).where('status', '!=', 'delete').get();
                if (!query.empty) {
                    return "Name Already Exist";
                } else {
                    let playerStatus = payload.type === 'lounge' ? 'inLounge' : 'waiting';
                    const resp = await firebase.firestore().collection("members").add({ name: payload.name, status: playerStatus });
                    await firebase.firestore().collection("members").doc(resp.id).set({ id: resp.id }, { merge: true });
                    const player = { name: payload.name, status: playerStatus, id: resp.id };
                    commit("set_playerInfo", player);
                    if (playerStatus === 'inLounge') {
                        const data = await firebase.firestore().collection("lounge").where("count", "<", 4).limit(1).get();
                        let group = {};
                        if (!data.empty) {
                            group = data.docs[0].data();
                        } else {
                            group.members = [];
                        }
                        group.members.push(player);
                        group.count = group.members.length;
                        if (group.count === 1) {
                            group.shuffler = player.id;
                            const resp = await firebase.firestore().collection("lounge").add(group);
                            firebase.firestore().collection("lounge").doc(resp.id).set({ id: resp.id }, { merge: true });
                            group.id = resp.id;
                        } else {
                            firebase.firestore().collection("lounge").doc(group.id).set(group, { merge: true });
                        }
                        commit("set_lounge", group);
                    } else {
                        const obj = { members: [player], memberCount: 1, gameStatus: 'ready', shuffler: player.id };
                        dispatch('setGroups', obj);
                    }
                }
            } catch (error) {
                console.log(error);
            }
        },
        deleteMember({ commit, state }, payload) {
            try {
                let updatedGrp = state.group ? state.group : state.lounge;
                const groupMembers = updatedGrp.members.filter(item => item.id !== payload);
                let flagBots = true;
                let members = 0;
                groupMembers.forEach(ele => {
                    if (ele.status) {
                        flagBots = false;
                        if (payload === updatedGrp.shuffler) {
                            updatedGrp.shuffler = ele.id;
                        }
                        members++;
                    }
                })
                if (flagBots) {
                    if (state.playerInfo.status === 'inLounge') {
                        firebase.firestore().collection("lounge").doc(state.lounge.id).delete();
                    } else {
                        firebase.firestore().collection("groups").doc(state.group.id).delete();
                    }
                } else {
                    if (state.playerInfo.status !== 'inLounge') {
                        const names = ["abhay", "chotu", "shivam", "latika", "akash", "pallavi", "thor", "mak", "bitzz", "gabbar"];
                        let obj = {
                            name: names[Math.floor(Math.random() * names.length)],
                            id: Math.floor(Math.random() * 1001)
                        }
                        groupMembers.push(obj);
                        updatedGrp.memberCount = members;
                    } else {
                        updatedGrp.count = members;
                    }
                    updatedGrp.members = groupMembers;
                    if (state.playerInfo.status === 'inLounge') {
                        firebase.firestore().collection("lounge").doc(state.lounge.id).set(updatedGrp, { merge: true });
                    } else {
                        firebase.firestore().collection("groups").doc(state.group.id).set(updatedGrp, { merge: true });
                    }
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
                        state.playerInfo = obj;
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
                    gameStatus: state.group.gameStatus === 'round2' ? "over" : "round2"
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
                    firebase.firestore().collection("groups").doc(state.group.id).set({ members: groupMembers }, { merge: true });
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
                    firebase.firestore().collection("groups").doc(state.group.id).set({ gameStatus: currentGameStatus, members: groupMembers }, { merge: true });
                    commit("set_group", { ...state.group, gameStatus: currentGameStatus, members: groupMembers });
                } else {
                    firebase.firestore().collection("groups").doc(state.group.id).delete();
                    let members = 0;
                    let filterMembers = data.data().members.filter(el => el.status)
                    data.data().members.forEach(obj => {
                        if (obj.status) {
                            firebase.firestore().collection("members").doc(obj.id).set({ status: "waiting" }, { merge: true });
                            members++;
                        }
                    });
                    const group = { members: filterMembers, memberCount: members, gameStatus: 'ready', shuffler: data.data().shuffler };
                    dispatch('setGroups', group);
                }
            } catch (error) {
                console.log(error);
            }
        },
        async joinLounge({ commit }, payload) {
            try {
                const data = await firebase.firestore().collection("lounge").doc(payload.id).get();
                const loungeInfo = data.data();
                if (!data.exists) {
                    return "No group found";
                } else if (loungeInfo.count === 4) {
                    return "Group is full";
                }
                const query = await firebase.firestore().collection('members').where('name', '==', payload.name).where('status', '!=', 'delete').get();
                if (!query.empty) {
                    return "Name Already Exist";
                } else {
                    const resp = await firebase.firestore().collection("members").add({ name: payload.name, status: 'inLounge' });
                    await firebase.firestore().collection("members").doc(resp.id).set({ id: resp.id }, { merge: true });
                    const player = { name: payload.name, status: 'inLounge', id: resp.id };
                    commit("set_playerInfo", player);
                    loungeInfo.count++;
                    loungeInfo.members.push(player);
                    firebase.firestore().collection("lounge").doc(payload.id).set(loungeInfo, { merge: true });
                    commit("set_lounge", loungeInfo);
                }
            } catch (error) {
                console.log(error);
            }
        },
        startGame({ commit, dispatch, state }) {
            try {
                firebase.firestore().collection("lounge").doc(state.lounge.id).delete();
                const obj = { members: state.lounge.members, memberCount: state.lounge.count, gameStatus: 'ready', shuffler: state.lounge.shuffler }
                dispatch('setGroups', obj);
            } catch (error) {
                console.log(error);
            }
        },
    },
    mutations: {
        set_group: (state, data) => {
            state.group = data;
        },
        set_playerInfo: (state, data) => {
            state.playerInfo = data;
        },
        set_lounge: (state, data) => {
            state.lounge = data;
        },
        game_status: (state, data) => {
            state.gameStarted = data;
        },
        clear_state: (state) => {
            state.playerInfo = null;
            state.group = null;
            state.gameStarted = false;
            state.lounge = null;
        },
    }
}