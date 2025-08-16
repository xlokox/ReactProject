import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Title,
  Paragraph,
  Card,
  Button,
  List,
  Avatar,
} from 'react-native-paper';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'התנתקות',
      'האם אתה בטוח שברצונך להתנתק?',
      [
        { text: 'ביטול', style: 'cancel' },
        { 
          text: 'התנתק', 
          style: 'destructive',
          onPress: async () => {
            await logout();
            navigation.replace('Login');
          }
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.profileCard}>
        <Card.Content style={styles.profileContent}>
          <Avatar.Text 
            size={80} 
            label={user?.name?.charAt(0) || 'U'} 
            style={styles.avatar}
          />
          <Title style={styles.userName}>{user?.name || 'משתמש'}</Title>
          <Paragraph style={styles.userEmail}>{user?.email}</Paragraph>
        </Card.Content>
      </Card>

      <Card style={styles.menuCard}>
        <List.Item
          title="עריכת פרופיל"
          left={props => <List.Icon {...props} icon="account-edit" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to edit profile */}}
        />
        
        <List.Item
          title="כתובות משלוח"
          left={props => <List.Icon {...props} icon="map-marker" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to addresses */}}
        />
        
        <List.Item
          title="אמצעי תשלום"
          left={props => <List.Icon {...props} icon="credit-card" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to payment methods */}}
        />
        
        <List.Item
          title="הגדרות"
          left={props => <List.Icon {...props} icon="cog" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to settings */}}
        />
        
        <List.Item
          title="צור קשר"
          left={props => <List.Icon {...props} icon="help-circle" />}
          right={props => <List.Icon {...props} icon="chevron-right" />}
          onPress={() => {/* Navigate to contact */}}
        />
      </Card>

      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutButton}
        textColor="#F44336"
      >
        התנתק
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileContent: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatar: {
    backgroundColor: '#2196F3',
    marginBottom: 16,
  },
  userName: {
    fontSize: 24,
    marginBottom: 4,
  },
  userEmail: {
    color: '#666',
  },
  menuCard: {
    margin: 16,
    elevation: 2,
  },
  logoutButton: {
    margin: 16,
    borderColor: '#F44336',
  },
});
