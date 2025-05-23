import { useAuth } from '../context/AuthContext';

const Notification = () => {
  const { notification } = useAuth();
  console.log(notification)
  return (
    notification && (
      <div style={{ background: 'yellow', color: 'white', padding: '10px' }}>
        {notification}
      </div>
    )
  );
};

export default Notification;
