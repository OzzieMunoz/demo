import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useClassroom } from '../frankenweb-ng/frankenweb-rn/src/context/ClassroomContext';
import { Classroom, Assignment } from '../frankenweb-ng/frankenweb-rn/shared/types/databaseobjects';
import { ApiResponse } from '../frankenweb-ng/frankenweb-rn/shared/types/datatypes';
import { useAuth } from '../frankenweb-ng/frankenweb-rn/src/context/AuthContext';
import { API_BASE_URL, API_ROUTES, getAuthHeaders } from '../frankenweb-ng/frankenweb-rn/client/config';

const ClassroomSelectionScreen: React.FC = () => {
    const navigation = useNavigation();
    const { setSelectedClassroom, setSelectedAssignment } = useClassroom();
    const { currentUser } = useAuth();
    const [classrooms, setClassrooms] = useState<Classroom[]>([]);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        console.log('Current user object:', JSON.stringify(currentUser, null, 2));
        if (currentUser && currentUser.user_id) {
            console.log('Fetching classrooms for user:', currentUser.user_id);
            fetchClassrooms();
        } else {
            console.log('No valid user ID available. User object:', currentUser);
            setLoading(false);
        }
    }, [currentUser]);

    useEffect(() => {
        if (selectedClassroomId) {
            fetchAssignments(selectedClassroomId);
        }
    }, [selectedClassroomId]);

    const fetchClassrooms = async () => {
        if (!currentUser?.user_id) {
            console.log('No user ID available for fetch');
            setLoading(false);
            return;
        }

        try {
            const headers = await getAuthHeaders();
            console.log('Making API request to:', `${API_BASE_URL}/classroom/user/${currentUser.user_id}`);
            const response = await fetch(`${API_BASE_URL}/classroom/user/${currentUser.user_id}`, {
                headers
            });
            console.log('API Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<Classroom[]> = await response.json();
            console.log('API Response data:', JSON.stringify(data, null, 2));

            if (data.success && data.data) {
                console.log('Setting classrooms:', data.data);
                setClassrooms(data.data);
            } else {
                console.log('API Error:', data.message);
                setError(data.message || 'Failed to fetch classrooms');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Error fetching classrooms');
        } finally {
            console.log('Setting loading to false');
            setLoading(false);
        }
    };

    const fetchAssignments = async (classroomId: number) => {
        try {
            const headers = await getAuthHeaders();
            console.log('Fetching assignments for classroom:', classroomId);
            const response = await fetch(`${API_BASE_URL}/assignments/classroom/${classroomId}`, {
                headers
            });
            console.log('Assignments response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: ApiResponse<Assignment[]> = await response.json();
            console.log('Assignments response data:', JSON.stringify(data, null, 2));

            if (data.success && data.data) {
                console.log('Setting assignments:', data.data);
                setAssignments(data.data);
            } else {
                console.error('API Error:', data.message);
                setError(data.message || 'Failed to fetch assignments');
            }
        } catch (err) {
            console.error('Error fetching assignments:', err);
            setError('Error fetching assignments');
        }
    };

    const handleClassroomSelect = (classroom: Classroom) => {
        setSelectedClassroomId(classroom.classroom_id);
        setSelectedClassroom(classroom);
    };

    const handleAssignmentSelect = (assignment: Assignment) => {
        console.log('Selected assignment:', assignment);
        if (!assignment.assignment_id) {
            console.error('Assignment ID is missing');
            setError('Invalid assignment data');
            return;
        }
        setSelectedAssignment(assignment);
        navigation.navigate('Home' as never);
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#88AB57" />
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.centered}>
                <Text style={styles.errorText}>Error: {error}</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Select a Classroom</Text>

            <View style={styles.content}>
                {/* Classroom Selection */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Classrooms</Text>
                    <FlatList
                        data={classrooms}
                        keyExtractor={item => item.classroom_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    selectedClassroomId === item.classroom_id && styles.selectedItem
                                ]}
                                onPress={() => handleClassroomSelect(item)}
                            >
                                <Text style={styles.itemTitle}>{item.name}</Text>
                                <Text style={styles.itemSubtitle}>
                                    Created: {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>

                {/* Assignment Selection */}
                {selectedClassroomId && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Assignments</Text>
                        <FlatList
                            data={assignments}
                            keyExtractor={item => item.assignment_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.item} onPress={() => handleAssignmentSelect(item)}>
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    {item.description && <Text style={styles.itemDescription}>{item.description}</Text>}
                                    {item.due_date && <Text style={styles.itemSubtitle}>Due: {new Date(item.due_date).toLocaleDateString()}</Text>}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyText}>No assignments available</Text>}
                        />
                    </View>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: '#061811',
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#061811',
    },
    title: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#88AB57',
        marginBottom: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1
    },
    section: {
        marginBottom: 16
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#EAEAEA',
        marginBottom: 8,
    },
    item: {
        padding: 16,
        backgroundColor: '#0A2A1B',
        borderRadius: 8,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: '#88AB57',
    },
    selectedItem: {
        backgroundColor: '#145B34',
    },
    itemTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 14,
        color: '#CCCCCC',
        marginBottom: 4,
    },
    itemSubtitle: {
        fontSize: 12,
        color: '#AAAAAA',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 16,
    },
    errorText: {
        color: '#E53935',
        textAlign: 'center',
    },
});

export default ClassroomSelectionScreen; 