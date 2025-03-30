ALTER TABLE public.user_filters
    ADD CONSTRAINT user_filters_user_id_key UNIQUE (user_id);

    ALTER TABLE public.user_visible_columns
    ADD CONSTRAINT user_visible_columns_user_id_key UNIQUE (user_id);
