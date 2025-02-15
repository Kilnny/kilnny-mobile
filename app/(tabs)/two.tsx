import React, { useState, useEffect } from 'react';
import { FlatList, RefreshControl, Image } from 'react-native';
import { MyText, MyView } from '@/components/Themed';
import SkeletonPost from '@/components/SkeletonPost';

const initialPosts = [
  {
    id: 1,
    imageUrl: 'https://cdn.pixabay.com/photo/2015/09/10/21/53/fractal-935011_640.jpg',
    description: 'Beautiful fractal image',
  },
  {
    id: 2,
    imageUrl: 'https://cdn.pixabay.com/photo/2012/03/02/12/41/fractal-21236_640.jpg',
    description: 'Amazing fractal pattern',
  },
  // Agrega más posts aquí
];

export default function TabTwoScreen() {
  const [posts, setPosts] = useState(initialPosts);
  const [refreshing, setRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const onRefresh = () => {
    setRefreshing(true);
    setIsLoading(true);
    setTimeout(() => {
      setPosts(initialPosts);
      setRefreshing(false);
      setIsLoading(false);
    }, 2000);
  };

  useEffect(() => {
    setTimeout(() => {
      setPosts(initialPosts);
      setIsLoading(false);
    }, 2000);
  }, []);

  const renderItem = ({ item }: any) => (
    <MyView className="mb-4">
      <Image
        style={{ width: '100%', height: 200, backgroundColor: '#e0e0e0' }}
        source={{ uri: item.imageUrl }}
        resizeMode="cover"
      />
      <MyText className="mt-2">{item.description}</MyText>
    </MyView>
  );

  return (
    <MyView className="flex-1 p-4">
      <FlatList
        data={isLoading ? Array(5).fill({}) : posts}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => isLoading ? <SkeletonPost /> : renderItem({ item })}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />
    </MyView>
  );
}