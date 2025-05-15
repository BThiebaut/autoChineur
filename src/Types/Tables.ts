const Tables = {
    users : {
        name : 'users',
        fields : {
            id           : 'user_id',
            username     : 'user_username',
            email        : 'user_mail',
        }
    },
    tasks : {
        name : 'tasks',
        fields : {
            id      : 'task_id',
            user    : 'task_user_id',
            query   : 'task_query',
            location : 'task_location',
            priceMin : 'task_price_min',
            priceMax : 'task_price_max',
        }
    }
};