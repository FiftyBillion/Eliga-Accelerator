import Axios from "axios"

export default {
    namespaced: true,
    state: {
        startEnd: [],
        totalTask: '',
        data: {},
        data2: {},
        chart: {},
        chart2: {},
        lineChart: []
    },
    mutations: {
        SET_START_END: (state, startEnd) => {
            state.startEnd = startEnd
        },
        SET_DATA: (state, {dates, taskNumb}) => {
            Object.assign(state.data,{[state.startEnd[0]]: state.totalTask})
            Object.assign(state.data2,{[state.startEnd[0]]: state.totalTask})
            var startdate = new Date(state.startEnd[0])
            var enddate = new Date(state.startEnd[1])
            var totalDays = (enddate.getTime() - startdate.getTime()) / (1000*3600*24)
            var taskeachday = state.totalTask / totalDays
            var nowTask = state.totalTask
            console.log(taskeachday)
            for(var i = 0; i < dates.length; i++) {
                Object.assign(state.data, {[dates[i]]: taskNumb[i]})
                if(i == 0) {
                    var d2 = new Date(dates[0])
                    var days = (d2.getTime() - startdate.getTime())/ (1000*3600*24)
                    Object.assign(state.data2, {[dates[0]]: nowTask - (days * taskeachday)})
                    nowTask -= days * taskeachday
                } else {
                    var dd2 = new Date(dates[i])
                    var dd1 = new Date(dates[i-1])
                    var ddays = (dd2.getTime() - dd1.getTime())/(1000*3600*24)
                    Object.assign(state.data2, {[dates[i]]: nowTask - (ddays * taskeachday)})
                    nowTask -= ddays * taskeachday
                }
            }
            Object.assign(state.data2,{[state.startEnd[1]]: 0})
            Object.assign(state.chart, {name: "Actual Tasks", data: state.data})
            Object.assign(state.chart2, {name: "Ideal Tasks", data: state.data2})
            state.lineChart=[state.chart, state.chart2]
        },
        SET_TOTAL: (state, totalTask) => {
            state.totalTask = totalTask
        },
        RESET_CHART: (state) => {
            state.data = {}
            state.data2 = {}
        }
    },
    actions: {
        setStartEnd: ({ commit }, startEnd) => {
            commit("SET_START_END", startEnd)
        },
        setData: ({ commit }) => {
            var dates = []
            var taskNumb = []
            var totalTask
            Axios.get('http://54.188.22.63/api/task/')
            .then(Response => {
                commit('SET_TOTAL', Response.data.length)
                totalTask = Response.data.length
                for(var i = 0; i < Response.data.length; i++) {
                    if(Response.data[i].dateCompleted != null && !dates.includes(Response.data[i].dateCompleted)) {
                        dates.push(Response.data[i].dateCompleted)
                    }
                }
                dates.sort()
                for(var j = 0; j < dates.length; j++) {
                    Axios.get(`http://54.188.22.63/api/task/?dateCompleted=${dates[j]}`)
                    .then(Response => {
                        taskNumb.push(totalTask - Response.data.length)
                        totalTask -= Response.data.length
                        commit('SET_DATA', {dates, taskNumb})
                    })
                }
            })
        },
        resetChart: ({ commit }) => {
            commit('RESET_CHART')
        }
    }
}