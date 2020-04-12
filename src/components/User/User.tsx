import { CircularProgress } from '@material-ui/core';
import { action } from 'mobx';
import { observer } from 'mobx-react';
import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppContext } from '../../app-context';
import { User } from '../../models/user';
import { UserWebProfile } from '../../models/user-web-profile';
import Error from '../Error';
import UserView from '../User/UserView';

export interface UserWithWebProfiles extends User {
  webProfiles: UserWebProfile[];
}

const UserComponent = () => {
  const { api } = useContext(AppContext);
  const { user: userID } = useParams();
  const [user, setUser] = useState<UserWithWebProfiles | undefined>();
  const [isLoading, setLoading] = useState<boolean>();
  const [error, setError] = useState<boolean>();

  useEffect(() => {
    if (!userID) {
      return;
    }

    setError(false);
    setLoading(true);

    api
      .loadUser(userID)
      .then((user) =>
        api.loadUserWebProfiles(user.id).then((profiles) => ({
          user,
          profiles,
        }))
      )
      .then(
        action(({ user, profiles }) =>
          setUser({ ...user, webProfiles: profiles })
        )
      )
      .catch(
        action((err) => {
          console.error(err);
          setError(true);
        })
      )
      .finally(() => setLoading(false));
  }, [userID, api]);

  if (isLoading) {
    return (
      <div className="loader-wrap">
        <CircularProgress />
      </div>
    );
  }

  if (error) {
    return <Error>Failed to load user</Error>;
  }

  if (!user) {
    return null;
  }

  return <UserView user={user} />;
};

export default observer(UserComponent);