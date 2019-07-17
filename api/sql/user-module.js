const { GraphQLApi } = require('api/config/graphql');

module.exports = {
  build: () => {
    query = {
      type: 'bulk',
      args: [
        // Создаем расширение citext, если оно не создано. С его помощью можно присваивать колонкам тип citext(Case insensitive text), вместо обычного text.
        // Это позволяет делать проверку на уникальность данных колонки регистронезависимой. (Т.е. qwerty = QWERTY = QwErTY и т.д.)
        {
          type: 'run_sql',
          args: {
            sql: 'CREATE EXTENSION IF NOT EXISTS citext;',
          },
        },

        // Создаем расшируние pgcrypto. В данном случае для генерации uuid на уровне самой БД
        { type: 'run_sql', args: { sql: 'CREATE EXTENSION IF NOT EXISTS pgcrypto;' } },

        // Создаем таблицу пользователей
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."users"("id" serial NOT NULL, "username" citext NOT NULL, "email" citext, "password" text, "verified" boolean NOT NULL DEFAULT false, "group_id" integer , PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("username"), UNIQUE ("email"));',
          },
        },
        { type: 'add_existing_table_or_view', args: { name: 'users', schema: 'public' } },

        // Создаем таблицу метаданных пользователя
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."user_metadata"("user_id" serial NOT NULL, "avatar" text, "name" text, "language" text, "timezone" text, "dateFormat" text, "country" text, "googleID" text, "googleData" text, "facebookID" text,"facebookData" text, "vkID" text, "vkData" text,"telegramID" text, "telegramData" text, "createdAt" timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY ("user_id") , UNIQUE ("user_id"), UNIQUE("googleID"), UNIQUE("facebookID"), UNIQUE("vkID"), UNIQUE("telegramID"));',
          },
        },
        { type: 'add_existing_table_or_view', args: { name: 'user_metadata', schema: 'public' } },

        // Создаем таблицу настреок приватности и безопасности пользователя пользователя
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."user_safety"("user_id" serial NOT NULL, "emailVerification" uuid, "repairKey" uuid,  PRIMARY KEY ("user_id") , UNIQUE ("user_id"), UNIQUE("emailVerification"), UNIQUE("repairKey"))',
          },
        },
        { type: 'add_existing_table_or_view', args: { name: 'user_safety', schema: 'public' } },

        // Связываем таблицы пользователей и метаданных пользователя. Каждому пользователю соответствует 1 строчка из таблицы метаданных
        {
          type: 'create_object_relationship',
          args: {
            name: 'metadata',
            table: { name: 'users', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'user_metadata', schema: 'public' },
                column_mapping: { id: 'user_id' },
              },
            },
          },
        },

        // В свою очередь каждому экземпляру метаданных соответствует 1 пользователь
        {
          type: 'create_object_relationship',
          args: {
            name: 'user',
            table: { name: 'user_metadata', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { user_id: 'id' },
              },
            },
          },
        },

        // Связываем таблицы пользователей и настроек безопасности пользователя. Каждому пользователю соответствует 1 строчка из таблицы user_safety
        {
          type: 'create_object_relationship',
          args: {
            name: 'safety',
            table: { name: 'users', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'user_safety', schema: 'public' },
                column_mapping: { id: 'user_id' },
              },
            },
          },
        },

        // В свою очередь каждому экземпляру user_safety соответствует 1 пользователь
        {
          type: 'create_object_relationship',
          args: {
            name: 'user',
            table: { name: 'user_safety', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { user_id: 'id' },
              },
            },
          },
        },

        // Создаем таблицу групп
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."groups"("id" serial NOT NULL, "name" citext NOT NULL, "slug" citext NOT NULL, "leader_id" integer NOT NULL, "clan_id" integer, "createdAt" timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("name"), UNIQUE ("slug"), UNIQUE ("leader_id"));',
          },
        },
        { type: 'add_existing_table_or_view', args: { name: 'groups', schema: 'public' } },

        // Связываем таблицы пользователей и групп
        // В группе может состоять множество пользователей (members)
        {
          type: 'create_array_relationship',
          args: {
            name: 'members',
            table: { name: 'groups', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { id: 'group_id' },
              },
            },
          },
        },

        // Пользователь может состоять лишь в одной группе (party)
        {
          type: 'create_object_relationship',
          args: {
            name: 'party',
            table: { name: 'users', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'groups', schema: 'public' },
                column_mapping: { group_id: 'id' },
              },
            },
          },
        },

        // Связываем колонку leader_id таблицы групп с таблицей пользователей
        {
          type: 'create_object_relationship',
          args: {
            name: 'leader',
            table: { name: 'groups', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { leader_id: 'id' },
              },
            },
          },
        },

        /**
         * Создаем таблицу, в которой сохраняются все приглашения пользователей в группу.
         * Затем связываем ее с таблицами пользователей и групп
         */
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."group_invitations"("id" serial NOT NULL, "invitee_user_id" integer NOT NULL, "group_id" integer NOT NULL, "inviter_user_id" integer NOT NULL, "date" timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("id"));',
          },
        },
        {
          type: 'add_existing_table_or_view',
          args: { name: 'group_invitations', schema: 'public' },
        },

        // Связываем таблицу group_invitations с таблицами групп и пользователей
        // У каждой группы может быть много инвайтов (т.е. в нее можно приглашать множество пользователей)
        {
          type: 'create_array_relationship',
          args: {
            name: 'membersInvitations',
            table: { name: 'groups', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'group_invitations', schema: 'public' },
                column_mapping: { id: 'group_id' },
              },
            },
          },
        },

        // Каждого пользователя могут приглашать в несколько групп (но вступить можно только в одну)
        {
          type: 'create_array_relationship',
          args: {
            name: 'groupInvitations',
            table: { name: 'users', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'group_invitations', schema: 'public' },
                column_mapping: { id: 'invitee_user_id' },
              },
            },
          },
        },

        // Связываем приглашение в группу с пользователем, отправившим его (inviter)
        {
          type: 'create_object_relationship',
          args: {
            name: 'inviter',
            table: { name: 'group_invitations', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { inviter_user_id: 'id' },
              },
            },
          },
        },

        // Связываем приглашение в группу с самим экземпляром этой группы из таблицы groups
        {
          type: 'create_object_relationship',
          args: {
            name: 'group',
            table: { name: 'group_invitations', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'groups', schema: 'public' },
                column_mapping: { group_id: 'id' },
              },
            },
          },
        },

        /**
         * Создаем таблицу кланов.
         * Затем связаваем таблицы кланов и групп
         */
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."clans"("id" serial NOT NULL, "name" citext NOT NULL, "slug" citext NOT NULL, "leader_id" integer NOT NULL, "createdAt" timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("id"), UNIQUE ("name"), UNIQUE ("slug"), UNIQUE ("leader_id"));',
          },
        },
        { type: 'add_existing_table_or_view', args: { name: 'clans', schema: 'public' } },

        // Связываем колонку leader_id таблицы кланов с таблицей пользователей
        {
          type: 'create_object_relationship',
          args: {
            name: 'leader',
            table: { name: 'clans', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { leader_id: 'id' },
              },
            },
          },
        },

        // В клане может состоять множество групп (parties)
        {
          type: 'create_array_relationship',
          args: {
            name: 'parties',
            table: { name: 'clans', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'groups', schema: 'public' },
                column_mapping: { id: 'clan_id' },
              },
            },
          },
        },

        // Группа может состоять только в одном клане
        {
          type: 'create_object_relationship',
          args: {
            name: 'clan',
            table: { name: 'groups', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'clans', schema: 'public' },
                column_mapping: { clan_id: 'id' },
              },
            },
          },
        },

        // Создаем таблицу, в которой сохраняются приглашения групп в кланы
        {
          type: 'run_sql',
          args: {
            sql:
              'CREATE TABLE "public"."clan_invitations"("id" serial NOT NULL, "group_id" integer NOT NULL, "clan_id" integer NOT NULL, "inviter_id" integer NOT NULL, "date" timestamp with time zone NOT NULL DEFAULT now(), PRIMARY KEY ("id") , UNIQUE ("id"));',
          },
        },
        {
          type: 'add_existing_table_or_view',
          args: { name: 'clan_invitations', schema: 'public' },
        },

        // Каждый клан может приглашать множество групп в свой состав
        {
          type: 'create_array_relationship',
          args: {
            name: 'invitations',
            table: { name: 'clans', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'clan_invitations', schema: 'public' },
                column_mapping: { id: 'clan_id' },
              },
            },
          },
        },

        // Каждая группа может быть приглашена в несколько кланов (но принять только 1 приглашение)
        {
          type: 'create_array_relationship',
          args: {
            name: 'clanInvitations',
            table: { name: 'groups', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'clan_invitations', schema: 'public' },
                column_mapping: { id: 'group_id' },
              },
            },
          },
        },

        // Связываем приглашение в клан с пользователем, отправившим его (inviter)
        {
          type: 'create_object_relationship',
          args: {
            name: 'inviter',
            table: { name: 'clan_invitations', schema: 'public' },
            using: {
              manual_configuration: {
                remote_table: { name: 'users', schema: 'public' },
                column_mapping: { inviter_id: 'id' },
              },
            },
          },
        },
      ],
    };

    return GraphQLApi(query);
  },
};

yy = {
  type: 'bulk',
  args: [],
};
