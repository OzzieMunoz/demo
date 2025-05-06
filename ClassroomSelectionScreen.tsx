import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Classroom, Assignment } from '../../shared/types/databaseobjects';
import FileUpload from '../components/FileUpload';

// Mock data for preview
const mockClassrooms: Classroom[] = [
    { classroom_id: 1, name: 'Math 101', created_at: new Date().toISOString() },
    { classroom_id: 2, name: 'History 202', created_at: new Date().toISOString() },
    { classroom_id: 3, name: 'Science 303', created_at: new Date().toISOString() },
];

const mockAssignments: Assignment[] = [
    { assignment_id: 11, title: 'Algebra Homework', description: 'Solve equations', due_date: new Date().toISOString(), classroom_id: 1 },
    { assignment_id: 12, title: 'Geometry Quiz', description: 'Chapter 5 quiz', due_date: new Date().toISOString(), classroom_id: 1 },
];

type ClassroomSelectionMockProps = {};

const ClassroomSelectionScreenMock: React.FC<ClassroomSelectionMockProps> = () => {
    const navigation = useNavigation();
    const [classrooms] = useState<Classroom[]>(mockClassrooms);
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [selectedClassroomId, setSelectedClassroomId] = useState<number | null>(null);
    const [loading] = useState(false);
    const [error] = useState<string | null>(null);

    useEffect(() => {
        // when classroom selected, set mock assignments
        if (selectedClassroomId) {
            setAssignments(
                mockAssignments.filter(a => a.classroom_id === selectedClassroomId)
            );
        } else {
            setAssignments([]);
        }
    }, [selectedClassroomId]);

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
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Your Classrooms</Text>
                    <FlatList
                        data={classrooms}
                        keyExtractor={item => item.classroom_id.toString()}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[
                                    styles.item,
                                    selectedClassroomId === item.classroom_id && styles.selectedItem,
                                ]}
                                onPress={() => setSelectedClassroomId(item.classroom_id)}
                            >
                                <Text style={styles.itemTitle}>{item.name}</Text>
                                <Text style={styles.itemSubtitle}>
                                    Created: {new Date(item.created_at).toLocaleDateString()}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
                {selectedClassroomId && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Available Assignments</Text>
                        <FlatList
                            data={assignments}
                            keyExtractor={item => item.assignment_id.toString()}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.item}
                                    onPress={() => navigation.navigate('Home')}
                                >
                                    <Text style={styles.itemTitle}>{item.title}</Text>
                                    {item.description && (
                                        <Text style={styles.itemDescription}>{item.description}</Text>
                                    )}
                                    {item.due_date && (
                                        <Text style={styles.itemSubtitle}>
                                            Due: {new Date(item.due_date).toLocaleDateString()}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            )}
                            ListEmptyComponent={
                                <Text style={styles.emptyText}>No assignments available</Text>
                            }
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
        backgroundColor: '#061811',
        padding: 16,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#061811',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#88AB57',
        marginBottom: 16,
        textAlign: 'center',
    },
    content: {
        flex: 1,
    },
    section: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#EAEAEA',
        marginBottom: 8,
    },
    item: {
        padding: 16,
        borderRadius: 8,
        marginBottom: 8,
        backgroundColor: '#0A2A1B',
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

export default ClassroomSelectionScreenMock;