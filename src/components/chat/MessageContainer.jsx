import { Avatar, Divider, Flex, Image, Skeleton, SkeletonCircle, Text, useColorModeValue } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Message from "./Message";
import MessageInput from "./MessageInput";
import useShowToast from "../../hooks/useShowToast";
import { useRecoilValue } from "recoil";
import { selectedConversationAtom } from "../../atoms/messageAtom";
import userAtom from "../../atoms/userAtom";

function MessageContainer() {
    const skeletonMessages = [1, 2, 3, 4, 5];
    const [isLoadingMessages, setIsLoadingMessages] = useState(false);
    const [messages, setMessages] = useState(skeletonMessages);

    const currentUser = useRecoilValue(userAtom);
    const selectedConversation = useRecoilValue(selectedConversationAtom);
    const showToast = useShowToast();

    useEffect(() => {
        const getMessages = async () => {
            setIsLoadingMessages(true);
            setMessages(skeletonMessages);
            if(selectedConversation?._id === '') {
                return;
            }
            try {
                const response = await fetch(`http://localhost:5000/messages/${selectedConversation?.userId}`, {
                    method: "GET",
                    credentials: "include"
                })
                const data = await response.json();
                if(data.error) {
                    return showToast("Error getting messages", data.error, "error")
                }

                setMessages(data.data);
            } catch (error) {
                showToast("Error getting messages", error.message, "error");
            } finally {
                setIsLoadingMessages(false);
            }
        }

        getMessages();
    }, [selectedConversation])

    return (
        <Flex flex={70} bg={useColorModeValue("gray.200", "gray.dark")} 
            borderRadius={"md"} flexDirection={"column"} 
            p={2}
        >
            <Flex className="message-header" w={"full"} h={12} 
                alignItems={"center"} gap={2}
            >
                <Avatar src={selectedConversation?.userProfilePic} size={"sm"}/>
                <Text display={"flex"} alignItems={"center"} >
                    {selectedConversation?.username}
                    <Image src="/verified.png" w={4} h={4} ml={1}/>
                </Text>
            </Flex>

            <Divider />

            <Flex flexDirection={"column"} gap={4} p={2} my={4}
                overflowY={"scroll"} minH={"60vh"}
            >
                {messages?.map((msg, id) => {
                    return <Flex key={`message-${id}`} 
                        gap={2} alignItems={"center"} p={1}
                        borderRadius={"md"} flexDirection={"column-reverse"}
                        alignSelf={msg?.sender !== currentUser._id ? "flex-start" : "flex-end"}
                    >
                        {isLoadingMessages === true
                        ? <>
                            {msg?.sender !== currentUser._id && <SkeletonCircle size={10}/>}
                            <Flex flexDirection={"column"} gap={2}>
                                <Skeleton h={"80px"} w={"250px"} borderRadius={"16px"}/>
                            </Flex>
                            {msg?.sender === currentUser._id && <SkeletonCircle size={10}/>}
                        </>
                        : <>
                            <Message msg={msg} ownMessage={msg?.sender !== currentUser._id ? false : true} />
                        </>
                        }
                    </Flex>
                })}
            </Flex>


            <MessageInput setMessages={setMessages}/>
        </Flex>

    );
}

export default MessageContainer;